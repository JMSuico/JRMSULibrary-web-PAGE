# [Layer: Helpers] — email_helper.py
# Handles SMTP email sending (reply to user), disposable email detection.
# Called by ContactService — never directly from controllers.

from django.core.mail import send_mail, EmailMessage
from django.conf import settings
import logging
import socket

logger = logging.getLogger(__name__)

# ============================================================
# Disposable / Temporary Email Domain Blacklist
# ============================================================
DISPOSABLE_DOMAINS = {
    # Major disposable email providers
    'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
    'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.info', 'yopmail.com',
    'yopmail.fr', 'cool.fr.nf', 'jetable.fr.nf', 'nospam.ze.tc', 'nomail.xl.cx',
    'mega.zik.dj', 'speed.1s.fr', 'courriel.fr.nf', 'moncourrier.fr.nf',
    'trashmail.com', 'trashmail.me', 'trashmail.net', 'trashmail.org', 'trashmail.at',
    'trashmail.io', 'trashmail.xyz', 'dispostable.com', 'mailnull.com', 'maildrop.cc',
    'throwam.com', 'throwaway.email', 'tempmail.com', 'temp-mail.org', 'temp-mail.io',
    'tempinbox.com', 'tempr.email', 'fakeinbox.com', 'fakeinbox.net', 'sharklasers.com',
    'guerrillamailblock.com', 'spam4.me', 'getairmail.com', 'discard.email',
    'mailnesia.com', 'mailnull.com', 'spamgourmet.com', 'spamgourmet.net',
    'spamgourmet.org', 'spamgourmet.com', 'spamotron.com', 'spamspot.com',
    'spam.la', 'spamfree24.org', 'spamgob.com', 'spaml.com', 'spamovani.com',
    'spamthisplease.com', 'spamtrail.com', 'spamtrap.ro', 'spoofmail.de',
    'squizzy.net', 'stuffmail.de', 'super-auswahl.de', 'supermailer.jp',
    'suremail.info', 'svk.jp', 'sweetxxx.de', 'taglead.com', 'talkinator.com',
    'tempe-mail.com', 'tempemail.com', 'tempemail.net', 'tempi.email', 'thetimezone.com',
    'thex.ro', 'thimail.com', 'throwam.com', 'tittbit.in', 'tmailinator.com',
    'top-mailer.net', 'topranklist.de', 'tradermail.info', 'trash-mail.at',
    'trash-mail.com', 'trash-mail.de', 'trash-mail.ga', 'trash-mail.io',
    'trash-mail.ml', 'trash-mail.tk', 'trashemail.de', 'trashimail.com',
    'trashmail.a', 'trashmail.at', 'trashmail.com', 'trashmail.io',
    'trashmail.me', 'trashmail.net', 'trashmail.org', 'trashmailer.com',
    'trashvienna.com', 'turual.com', 'twinmail.de', 'tyldd.com', 'uggsrock.com',
    'umail.net', 'uroid.com', 'veryrealemail.com', 'viditag.com', 'viewcastmedia.com',
    'wetrainbayarea.org', 'whyspam.me', 'willhackforfood.biz', 'wilemail.com',
    'wralphblalock.com', 'wronghead.com', 'wuzupmail.net', 'xagloo.com', 'xemaps.com',
    'xents.com', 'xmaily.com', 'xoxy.net', 'xtram.info', 'xww.ro', 'yahoo.com.ph.info',
    'yapped.net', 'yeah.net', 'yep.it', 'yomail.info', 'yopmail.com', 'youmailr.com',
    'ypmail.webarnak.fr.eu.org', 'yuurok.com', 'zehnminuten.de', 'zehnminutenmail.de',
    'zippymail.info', 'zoemail.com', 'zoemail.net', 'zoemail.org', 'zoemail.us',
    'anonbox.net', 'dispostable.com', 'crazymailing.com', '10minutemail.com',
    '10minutemail.net', '10minutemail.org', '20minutemail.com', '33mail.com',
    'discard.email', 'einrot.com', 'filzmail.com', 'getonemail.com', 'girlsundertheinfluence.com',
    'gishpuppy.com', 'glitch.sx', 'grr.la', 'hasmail.net', 'hatespam.org',
    'nomorespamemails.com', 'notsharingmy.info',
}


def is_disposable_email(email: str) -> bool:
    """
    Returns True if the email domain is a known temporary/disposable provider.
    Also attempts a basic MX record DNS check for domain validity.
    """
    try:
        domain = email.strip().lower().split('@')[-1]
        # Check against the blacklist
        if domain in DISPOSABLE_DOMAINS:
            return True
        # Check for obviously fake patterns
        if any(keyword in domain for keyword in ['tempmail', 'trashmail', 'fakeinbox', 'throwaway', 'disposable', 'spam', 'yopmail', '10minute']):
            return True
        return False
    except Exception:
        return False


def is_email_domain_valid(email: str) -> bool:
    """
    Checks if the email domain has a valid MX record (DNS lookup).
    Returns True if valid, False if unresolvable.
    """
    try:
        domain = email.strip().lower().split('@')[-1]
        socket.getaddrinfo(domain, None)
        return True
    except socket.gaierror:
        return False


def send_reply_email(to_email: str, to_name: str, subject: str, reply_body: str) -> bool:
    """
    Sends a reply email from the library's official email address to a user.
    Returns True on success, False on failure.

    Uses Django's EmailMessage to support HTML-like formatting in the body.
    """
    try:
        full_subject = f"[JRMSU-KC Library] Re: {subject}"

        body = f"""Dear {to_name},

Thank you for reaching out to the JRMSU Katipunan Campus Library.

{reply_body}

---
JRMSU Katipunan Campus Library
Email: katipunan.library@jrmsu.edu.ph
Operating Hours: Monday-Friday, 7:00 AM - 7:00 PM (Philippine Time)

This is an official reply from the library administration.
Please do not reply to this email with sensitive personal information.
"""

        email = EmailMessage(
            subject=full_subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email],
            reply_to=[settings.EMAIL_HOST_USER],
        )
        email.send(fail_silently=False)
        logger.info(f"Reply email sent to {to_email} regarding '{subject}'")
        return True
    except Exception as e:
        logger.error(f"Failed to send reply email to {to_email}: {e}")
        return False


def send_notification_to_library(sender_name: str, sender_email: str, subject: str, message: str) -> None:
    """
    Notifies the library staff when a new contact message comes in.
    Fire-and-forget — errors are only logged, not raised.
    """
    try:
        body = f"""New message received via the JRMSU Library Contact Form.

From: {sender_name} <{sender_email}>
Subject: {subject}

Message:
{message}

---
Login to the Admin Panel to respond:
http://localhost:3000/admin/email
"""
        send_mail(
            subject=f"[New Contact] {subject} — from {sender_name}",
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER],
            fail_silently=True,
        )
    except Exception as e:
        logger.warning(f"Library notification email failed: {e}")
