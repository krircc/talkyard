/*
 * Copyright (C) 2015 Kaj Magnus Lindberg
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/// <reference path="../../typedefs/jquery/jquery.d.ts" />
/// <reference path="../plain-old-javascript.d.ts" />

//------------------------------------------------------------------------------
   module debiki2.utils {
//------------------------------------------------------------------------------

var d = { i: debiki.internal, u: debiki.v0.util };

var diffMatchPatch;

// For now: [7UMFK2] (later, upgrade modules/definitely-typed — so includes diff-match-patch)
var diff_match_patch;
var DIFF_INSERT;
var DIFF_DELETE;
var DIFF_EQUAL;


export function getDiffMatchPatch() {
  dieIf(!diffMatchPatch, 'DwE7UMF4');
  return diffMatchPatch;
}


export function loadDiffMatchPatch(fn) {
  if (diffMatchPatch) {
    fn(diffMatchPatch);
  }
  else {
    d.i.loadEditorEtceteraScripts().done(() => {
      // For now: (see [7UMFK2] above)
      diff_match_patch = window['diff_match_patch'];
      DIFF_INSERT = window['DIFF_INSERT'];
      DIFF_DELETE = window['DIFF_DELETE'];
      DIFF_EQUAL = window['DIFF_EQUAL'];

      diffMatchPatch = new diff_match_patch();
      diffMatchPatch.Diff_Timeout = 1;  // seconds
      diffMatchPatch.Match_Distance = 100 * 1000;  // for now
      diffMatchPatch.maxMatchLength = diffMatchPatch.Match_MaxBits;
      diffMatchPatch.Diff_EditCost = 9;
      fn(diffMatchPatch);
    });
  }
}


export function makeHtmlDiff(oldText: String, newText: string): string {
  var diff = getDiffMatchPatch().diff_main(oldText, newText);
  // Could use: `diff_cleanupSemantic diff` instead, but that sometimes
  // result in the diff algorithm sometimes replacing too much old text.
  getDiffMatchPatch().diff_cleanupEfficiency(diff);
  var htmlString = prettyHtmlFor(diff);
  return htmlString;
};


/**
 * Converts a google-diff-match-patch diff array into a pretty HTML report.
 * Based on diff_match_patch.prototype.diff_prettyHtml(), here:
 *  http://code.google.com/p/google-diff-match-patch/source/browse/
 *    trunk/javascript/diff_match_patch_uncompressed.js
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} HTML representation.
 *
 * This function is:
 *     Copyright 2006 Google Inc.
 *     http://code.google.com/p/google-diff-match-patch/
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 */
function prettyHtmlFor(diffs){
  // (Converted from LiveScript, therefore looks a bit funny.)
  var html, x, i, pattern_amp, pattern_lt, pattern_gt, pattern_para, i$, to$, op, data, text;
  html = [];
  x = i = 0;
  pattern_amp = /&/g;
  pattern_lt = /</g;
  pattern_gt = />/g;
  pattern_para = /\n/g;
  for (i$ = 0, to$ = diffs.length - 1; i$ <= to$; ++i$) {
    x = i$;
    op = diffs[x][0];     // Operation (insert, delete, equal)
    data = diffs[x][1];   // Text of change.
    text = data.replace(pattern_amp, '&amp;').replace(pattern_lt, '&lt;').replace(pattern_gt, '&gt;').replace(pattern_para, '¶<br />');
    switch (op) {
    case DIFF_INSERT:
      html[x] = "<ins>" + text + "</ins>";
      break;
    case DIFF_DELETE:
      html[x] = "<del>" + text + "</del>";
      break;
    case DIFF_EQUAL:
      html[x] = "<span>" + text + "</span>";
    }
    // !== on the next line was a 100 lines deep-equals function auto-generated by LiveScript, probably not needed. Remove this comment if !== works.
    if (op !== DIFF_DELETE) {
      i += data.length;
    }
  }
  return html.join('');
};


//------------------------------------------------------------------------------
   }
//------------------------------------------------------------------------------
// vim: fdm=marker et ts=2 sw=2 tw=0 list