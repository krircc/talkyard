/**
 * Copyright (c) 2012 Kaj Magnus Lindberg (born 1979)
 */

package controllers

import com.debiki.v0._
import com.debiki.v0.Prelude._
import debiki._
import debiki.DebikiHttp._
import java.{util => ju}
import play.api._
import play.api.mvc.{Action => _, _}
import SafeActions._
import Utils.{OkHtml}


/**
 * Handles login; delegates to AppLoginGuest/OpenId and (?) -OAuth.
 *
 * Usage:
 * You could use views.html.login to how a login page in place of the
 * page that requires login. Then, views.html.login will post to
 * this class, AppLogin, which will eventually redirect back to the
 * returnToUrl.
 */
object AppLogin extends mvc.Controller {


  def showLoginForm() = showLoginFormReturnTo("")


  def showLoginFormReturnTo(returnToUrl: String) = CheckSidActionNoBody {
        (sidOk, xsrfOk, request) =>
    Ok(views.html.login(xsrfToken = xsrfOk.value, returnToUrl = returnToUrl,
      title = "Login", message = request.flash.get("WhyLogin")))
  }


  def loginWith(provider: String, returnToUrl: String) = ExceptionActionNoBody {
        implicit reqest =>
    asyncLogin(provider = provider, returnToUrl = returnToUrl)
  }


  def loginWithPostData(returnToUrl: String) = ExceptionAction(
        parse.urlFormEncoded(maxLength = 200)) { implicit request =>
    // For now. Should handle guest login forms too.
    AppLoginOpenId.asyncLoginWithPostData(returnToUrl = "")
  }


  def asyncLogin(provider: String, returnToUrl: String)
        (implicit request: Request[_]): Result = {

    def _loginWithOpenId(identifier: String): AsyncResult = {
      AppLoginOpenId.asyncLogin(openIdIdentifier = identifier,
        returnToUrl = returnToUrl)
    }

    // Not async? Will this block a thread??
    def _loginWithOAuth(provider: String): Result = {
      securesocial.core.ProviderRegistry.get(provider) match {
        case Some(p) =>
          try {
            p.authenticate().fold(
              result => result,
              user => {
                Logger.debug("User logged in: [" + user + "]")
                Redirect(returnToUrl) /* .withSession {
                  session +
                   (SecureSocial.UserKey -> user.id.id) +
                   (SecureSocial.ProviderKey -> user.id.providerId) -
                   SecureSocial.OriginalUrlKey
                }*/
              })
          } catch {
            case ex: securesocial.core.AccessDeniedException =>
              Logger.warn("User declined access using provider " + provider)
              throwForbidden("DwE93Z4", "You declined access?")
          }
        case None =>
          throwForbidden("DwE09PJ3", "Unsupported provider: "+ provider)
      }
    }

    provider match {
      case "google" =>
        _loginWithOpenId(IdentityOpenId.ProviderIdentifier.Google)
      case "yahoo" =>
        _loginWithOpenId(IdentityOpenId.ProviderIdentifier.Yahoo)
      case x =>
        _loginWithOAuth(provider = x)
    }
  }


  def showLogoutForm = ExceptionActionNoBody { implicit request =>
    OkHtml(
      <form action='' method='POST'>
        Really log out?
        <input type='submit' value='Yes'/>
      </form>)
  }


  /**
   * Clears login related cookies and OpenID and OpenAuth stuff.
   */
  // --- later, when is ?logout: -------
  // CheckSidAndPathAction(parse.urlFormEncoded(maxLength = 100)) {
  //  (sidOk, xsrfOk, pagePath, request) =>
  // -----------------------------------
  def logout = mvc.Action(parse.empty) { request =>
      /*
      val sidCookieVal = LiftUtil.decodeCookie("dwCoSid")
      val sid = sidCookieVal.map(Sid.checkSid(_)) openOr SidAbsent
      sid.loginId foreach { loginId =>
        try {
          Boot.dao.saveLogout(loginId, logoutIp = req.remoteAddr)
        } catch {
          case e: Throwable => logger.warn(
            "Error writing logout to database: "+ e.getMessage +
               " [error DwE35k0sk2i6]")  // COULD LOG stack trace?
          // Continue logging out anyway.
        }
      }
      */

      OkHtml(
        <p>
          You have been logged out. Return to last page? (Not implemented)
          <a href=''>Okay</a>
        </p>)
        // keep the xsrf cookie, so login dialog works?
        .discardingCookies(DiscardingCookie("dwCoSid"),
            DiscardingCookie(AppConfigUser.ConfigCookie))
    }

}
