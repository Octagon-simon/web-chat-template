import { useRef, useState } from "react";
import { useInstallPrompt, type InstallPlatform } from "../../lib/install";
import { IconCheck, IconDownload, IconPhone, IconShare } from "../Icons";
import { Page } from "./Page";

interface MobileAppPageProps {
  brand: string;
}

const env = import.meta.env;

//renders only when you point these at published listings
const STORES = [
  { id: "ios", label: "App Store", note: "iOS 17+", url: String(env.VITE_IOS_STORE_URL ?? "") },
  {
    id: "android",
    label: "Google Play",
    note: "Android 12+",
    url: String(env.VITE_ANDROID_STORE_URL ?? ""),
  },
].filter((store) => store.url.length > 0);

const INSTALL_HINT: Record<InstallPlatform, string> = {
  ios: "On iPhone and iPad, open this page in Safari, tap Share, then Add to Home Screen.",
  android: "On Android, open the browser menu, then tap Install app.",
  desktop: "Install from the icon in the address bar, or from the button above.",
};

export function MobileAppPage({ brand }: MobileAppPageProps) {
  const { canInstall, installed, platform, install } = useInstallPrompt();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const stepsRef = useRef<HTMLElement | null>(null);
  const link = window.location.origin + window.location.pathname;

  const copy = () => {
    void navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };

  const installApp = async () => {
    setBusy(true);
    const outcome = await install();
    setBusy(false);
    if (outcome === "unavailable") {
      stepsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <Page
      title="Mobile app"
      description="Install the same chat straight to a home screen. No store review, no wrapper build."
    >
      <section className="mobile-hero">
        <div className="mobile-hero-copy">
          <span className="pill">
            <IconPhone size={13} />
            {brand} for iOS and Android
          </span>
          <h2>Your chats, in your pocket.</h2>
          <p>
            The page you are looking at is already installable. Add it to your home screen and it
            opens full screen with its own icon and no browser chrome.
          </p>
          <div className="mobile-actions">
            {installed ? (
              <span className="install-chip">
                <IconCheck size={15} />
                Installed on this device
              </span>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={installApp}
                disabled={busy}
              >
                <IconDownload size={15} />
                {busy ? "Opening" : canInstall ? "Install app" : "How to install"}
              </button>
            )}
            {STORES.map((store) => (
              <a
                key={store.id}
                className="store-btn"
                href={store.url}
                target="_blank"
                rel="noreferrer"
              >
                <span className="store-btn-label">{store.label}</span>
                <span className="store-btn-note">{store.note}</span>
              </a>
            ))}
          </div>
          <span className="hint">{installed ? "Opens full screen, own icon, no address bar." : INSTALL_HINT[platform]}</span>
        </div>

        <div className="phone" aria-hidden="true">
          <div className="phone-screen">
            <div className="phone-notch" />
            <div className="phone-top">
              <span className="phone-dot" />
              <span>{brand}</span>
            </div>
            <div className="phone-row is-user">Summarize this thread</div>
            <div className="phone-row">
              Three points, in order, with the decision first.
            </div>
            <div className="phone-row is-user is-short">And the risks?</div>
            <div className="phone-composer">
              <span>Ask anything</span>
              <span className="phone-send" />
            </div>
          </div>
        </div>
      </section>

      <div className="mobile-grid">
        <section className="page-card">
          <h2 className="card-title">Open it on your phone</h2>
          <p className="card-sub">Copy the link, or drop your store QR into the slot below.</p>
          <div className="qr-row">
            <div className="qr-slot">
              <span>QR</span>
              <small>placeholder</small>
            </div>
            <div className="grow">
              <div className="link-box">
                <code>{link}</code>
              </div>
              <button type="button" className="btn btn-primary" onClick={copy}>
                {copied ? <IconCheck size={15} /> : <IconShare size={15} />}
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>
          </div>
        </section>

        <section className="page-card" ref={stepsRef}>
          <h2 className="card-title">Add to home screen</h2>
          <ol className="steps">
            <li>
              <strong>iOS</strong>
              <span>Open in Safari, tap Share, then Add to Home Screen.</span>
            </li>
            <li>
              <strong>Android</strong>
              <span>Open in Chrome, open the menu, then Install app.</span>
            </li>
            <li>
              <strong>Desktop</strong>
              <span>Use the install icon in the address bar.</span>
            </li>
          </ol>
        </section>
      </div>

      {STORES.length === 0 && (
        <div className="info-card">
          <strong>No store listing yet</strong>
          <p>
            This template ships the installable web build, so nothing is waiting on an app review.
            Set <code>VITE_IOS_STORE_URL</code> and <code>VITE_ANDROID_STORE_URL</code> at build
            time and the store buttons appear above.
          </p>
        </div>
      )}

      <div className="info-card">
        <strong>What a native shell needs</strong>
        <p>
          If you want push notifications or a store listing, wrap this build in a WebView shell
          (Capacitor or React Native WebView) and point it at your deployment. The UI already
          handles the mobile breakpoints, safe-area insets and the software keyboard.
        </p>
      </div>
    </Page>
  );
}
