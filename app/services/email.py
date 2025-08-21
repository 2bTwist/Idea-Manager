import logging
from app.core.config import settings

try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail, Email, To, Content
except Exception:  # pragma: no cover
    SendGridAPIClient = None

log = logging.getLogger(__name__)

def email_is_configured() -> bool:
    return (
        bool(settings.EMAIL_ENABLED)
        and bool(settings.SENDGRID_API_KEY)
        and bool(settings.MAIL_FROM)
        and SendGridAPIClient is not None
    )

def send_email(to_email: str, subject: str, html: str) -> None:
    """
    Sends email via SendGrid v3. In dev or when not configured,
    logs the payload instead of sending.
    """
    if not email_is_configured():
        log.warning("Email not configured; would send to=%s subject=%s", to_email, subject)
        log.info("DEV EMAIL BODY:\n%s", html)
        return

    msg = Mail(
        from_email=Email(settings.MAIL_FROM, settings.MAIL_FROM_NAME),
        to_emails=[To(email=to_email)],
        subject=subject,
        html_content=Content("text/html", html),
    )
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        resp = sg.send(msg)  # v3 /mail/send
        log.info("Email sent to %s (status %s)", to_email, resp.status_code)
    except Exception as e:  # pragma: no cover
        log.exception("Failed to send email to %s: %s", to_email, e)
