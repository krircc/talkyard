/// <reference path="../test-types.ts"/>

import _ = require('lodash');
import assert = require('assert');
import server = require('../utils/server');
import utils = require('../utils/utils');
import pages = require('../utils/pages');
import pagesFor = require('../utils/pages-for');
import settings = require('../utils/settings');
import logAndDie = require('../utils/log-and-die');
import createTestData = require('./create-site-impl');
const logUnusual = logAndDie.logUnusual, die = logAndDie.die, dieIf = logAndDie.dieIf;
const logMessage = logAndDie.logMessage;

declare let browser: any;

const newMembersEmail = 'e2e-test--mia@example.com';
const newMembersTopicTitle = 'newMembersTopicTitle';
const newMembersTopicText = 'newMembersTopicText';

describe('create-site-password  @createsite @login @password  TyT7BAWFPK9', () => {

  it('initialize', () => {
    browser = _.assign(browser, pagesFor(browser));
  });

  it('can create a new site as a Password user', () => {
    // Something timed out in here, twice. [E2EBUG]
    // Break up into smaller steps then? To find out what.
    const data = createTestData();
    browser.go(utils.makeCreateSiteWithFakeIpUrl());
    browser.disableRateLimits();
    pages.createSite.fillInFieldsAndSubmit(data);
    // New site; disable rate limits here too.
    browser.disableRateLimits();
    pages.createSite.clickOwnerSignupButton();
    pages.loginDialog.createPasswordAccount(data, true);
    const siteId = pages.getSiteId();
    const email = server.getLastEmailSenTo(siteId, data.email, browser);
    const link = utils.findFirstLinkToUrlIn(
        data.origin + '/-/login-password-confirm-email', email.bodyHtmlText);
    browser.go(link);
    browser.waitAndClick('#e2eContinue');

    browser.execute(function() {
      localStorage.setItem('runToursAlthoughE2eTest', 'true');
    });

    pages.createSomething.createForum("Password Forum Title");
  });

  it("the forum admin tour works", () => {
    assertTourSoonAppears(browser, true);
    console.log('Step 1');
    browser.waitAndClick('.s_Tour-Step-1 .s_Tour_D_Bs_NextB');
    console.log('Step 2');
    browser.waitAndClick('.s_Tour-Step-2 .s_Tour_D_Bs_NextB');
    console.log('Step 3');
    browser.waitAndClick('.s_Tour-Step-3 .s_Tour_D_Bs_NextB');
    console.log('Step 4');
    browser.waitAndClick('.s_Tour-Step-4 .s_Tour_D_Bs_NextB');
    console.log('Step 5');
    browser.waitAndClick('#e2eViewCategoriesB');
    console.log('Step 6');
    browser.waitAndClick('.s_Tour-Step-6 .s_Tour_D_Bs_NextB');
    console.log('Step 7');
    browser.waitAndClick('.s_Tour-Step-7 .s_Tour_D_Bs_NextB');
    console.log('Step 8');
    browser.waitAndClick('.esAvtrName_name');
    console.log('Step 9');
    browser.waitAndClick('.esMyMenu_admin [href]');
  });

  it("the admin area admin tour works", () => {
    console.log('Step 1');
    browser.waitAndClick('.s_Tour-Step-1 .s_Tour_D_Bs_NextB');
    console.log('Step 2');
    browser.waitAndClick('#e2eAA_Ss_LoginL');
    console.log('Step 3');
    browser.waitAndClick('.s_Tour-Step-3 .s_Tour_D_Bs_NextB');
    console.log('Step 4');
    browser.waitAndClick('.e_RvwB');
    console.log('Step 5');
    browser.waitAndClick('.s_Tour-Step-5 .s_Tour_D_Bs_NextB');
    console.log('Step 6');
    browser.waitAndClick('.e_UsrsB');
    console.log('Step 7');
    browser.waitAndClick('.e_InvitedUsB');
    console.log('Step 8');
    browser.waitAndClick('.s_Tour-Step-8 .s_Tour_D_Bs_NextB');
    console.log('Step 9');
    browser.waitAndClick('.s_Tour-Step-9 .s_Tour_D_Bs_NextB');
    console.log('Step 10');
    browser.waitAndClick('.s_Tour-Step-10 .s_Tour_D_Bs_NextB');
  });

  // Done with create site stuff. But let's test a little bit more, so we know the forum can
  // actually be used, once it's been created: Edit forum title and post a topic.

  it("goes back to the topic list", () => {
    browser.go('/');
  });

  it("the forum works: can edit forum title", () => {
    // --- Edit title
    pages.pageTitle.clickEdit();
    pages.pageTitle.editTitle("Pwd Frm Edtd");
    pages.pageTitle.save();
    browser.assertPageTitleMatches(/Pwd Frm Edtd/);
  });

  it("the forum works: can post a topic", () => {
    browser.waitAndClick('#e2eCreateSth');
    browser.waitAndSetValue('.esEdtr_titleEtc_title', "New tpc ttl");
    browser.setValue('textarea', "New tpc txt");
    browser.rememberCurrentUrl();
    browser.click('.e2eSaveBtn');
    browser.waitForNewUrl();
    browser.assertTextMatches('h1', /New tpc ttl/);
    browser.assertTextMatches('#post-1', /New tpc txt/);
  });


  it("the forum intro tour is shown just once", () => {
    browser.go('/');
    assertTourSoonAppears(browser, false);
  });

  it("... and the admin area tour, just once, it too", () => {
    browser.topbar.clickGoToAdmin();
    assertTourSoonAppears(browser, false);
  });

  function assertTourSoonAppears(browser, shoulBeVisible: boolean) {
    // Wait for the tour to appear. (There's no other way to do that right now,
    // than just waiting for a while. It appears within about a second.
    // Note that this is also used to test that the tour *does* appear fast enough,
    // not only that it does *not* appear — to test, that this test, works.)
    browser.pause(3000);
    assert.equal(browser.isVisible('.s_Tour'), shoulBeVisible);
  }

});
