import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClipboard } from "@/hooks/use-clipboard";
import { useInstallPrompt, type InstallPlatform } from "@/lib/install";
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

const infoCard = "rounded-xl border border-brand/20 bg-brand-soft px-4 py-3.5";

export function MobileAppPage({ brand }: MobileAppPageProps) {
  const { canInstall, installed, platform, install } = useInstallPrompt();
  const { copied, copy } = useClipboard(1600);
  const [busy, setBusy] = useState(false);
  const stepsRef = useRef<HTMLDivElement | null>(null);
  const link = window.location.origin + window.location.pathname;

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
      <section className="grid grid-cols-[minmax(0,1fr)_236px] items-center gap-6 rounded-card border border-border-soft bg-[linear-gradient(150deg,var(--brand-soft),var(--card)_68%)] p-6 max-[860px]:grid-cols-1 max-[860px]:p-5">
        <div>
          <Badge variant="brand" className="gap-1.5 bg-brand/10 px-2.5 py-1 text-foreground">
            <IconPhone size={13} />
            {brand} for iOS and Android
          </Badge>
          <h2 className="mt-2.5 mb-2 text-[clamp(22px,3vw,30px)] leading-[1.15] tracking-[-0.025em]">
            Your chats, in your pocket.
          </h2>
          <p className="m-0 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
            The page you are looking at is already installable. Add it to your home screen and it
            opens full screen with its own icon and no browser chrome.
          </p>
          <div className="mt-4 mb-2 flex flex-wrap gap-2">
            {installed ? (
              <span className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand-soft px-4 text-sm font-medium">
                <IconCheck size={15} />
                Installed on this device
              </span>
            ) : (
              <Button
                type="button"
                className="rounded-full px-[18px]"
                onClick={installApp}
                disabled={busy}
              >
                <IconDownload size={15} />
                {busy ? "Opening" : canInstall ? "Install app" : "How to install"}
              </Button>
            )}
            {STORES.map((store) => (
              <a
                key={store.id}
                href={store.url}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-10 flex-col items-start justify-center rounded-xl bg-send px-4 py-1.5 text-send-foreground transition-opacity hover:opacity-88"
              >
                <span className="text-sm font-semibold">{store.label}</span>
                <span className="text-xs opacity-80">{store.note}</span>
              </a>
            ))}
          </div>
          <span className="text-xs leading-relaxed text-faint">
            {installed ? "Opens full screen, own icon, no address bar." : INSTALL_HINT[platform]}
          </span>
        </div>

        <div
          aria-hidden="true"
          className="w-[212px] justify-self-center rounded-[34px] border border-border bg-background p-[9px] shadow-card max-[860px]:justify-self-start max-[860px]:h-[380px] max-[860px]:w-[200px] max-[560px]:hidden"
        >
          <div className="flex h-[392px] flex-col gap-2 overflow-hidden rounded-[26px] bg-rail px-2.5 py-3 max-[860px]:h-full">
            <div className="mx-auto mb-1 h-[5px] w-12 rounded-full bg-border" />
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <span className="size-1.5 rounded-full bg-brand" />
              <span>{brand}</span>
            </div>
            <div className="max-w-[90%] rounded-xl bg-card px-2.5 py-2 self-end text-xs leading-snug">
              Summarize this thread
            </div>
            <div className="max-w-[90%] rounded-xl bg-card px-2.5 py-2 text-xs leading-snug">
              Three points, in order, with the decision first.
            </div>
            <div className="max-w-[58%] self-end rounded-xl bg-bubble px-2.5 py-2 text-xs leading-snug">
              And the risks?
            </div>
            <div className="mt-auto flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-2.5 py-2 text-xs text-faint">
              <span>Ask anything</span>
              <span className="size-4 rounded-full bg-send" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 max-[860px]:grid-cols-1">
        <Card className="gap-3 rounded-2xl border-border-soft p-4">
          <h2 className="m-0 text-base font-semibold tracking-[-0.01em]">Open it on your phone</h2>
          <p className="m-0 text-sm leading-normal text-muted-foreground">
            Copy the link, or drop your store QR into the slot below.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex size-24 shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-border text-xs font-semibold tracking-[0.08em] text-faint">
              <span>QR</span>
              <small className="text-xs font-normal tracking-[0.04em]">placeholder</small>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex min-w-0 items-center gap-2 rounded-[10px] border border-border-soft bg-code py-2 pr-2 pl-[11px]">
                <code className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
                  {link}
                </code>
              </div>
              <Button type="button" className="rounded-full" onClick={() => copy(link)}>
                {copied ? <IconCheck size={15} /> : <IconShare size={15} />}
                {copied ? "Copied" : "Copy link"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="gap-3 rounded-2xl border-border-soft p-4" ref={stepsRef}>
          <h2 className="m-0 text-base font-semibold tracking-[-0.01em]">Add to home screen</h2>
          <ol className="mt-1 mb-0 flex list-decimal flex-col gap-2 pl-[18px] text-sm text-muted-foreground">
            <li>
              <strong className="block text-sm text-foreground">iOS</strong>
              <span>Open in Safari, tap Share, then Add to Home Screen.</span>
            </li>
            <li>
              <strong className="block text-sm text-foreground">Android</strong>
              <span>Open in Chrome, open the menu, then Install app.</span>
            </li>
            <li>
              <strong className="block text-sm text-foreground">Desktop</strong>
              <span>Use the install icon in the address bar.</span>
            </li>
          </ol>
        </Card>
      </div>

      {STORES.length === 0 && (
        <div className={infoCard}>
          <strong className="mb-1 block text-sm text-foreground">No store listing yet</strong>
          <p className="m-0 text-sm leading-relaxed text-muted-foreground">
            This template ships the installable web build, so nothing is waiting on an app review.
            Set <code className="font-mono text-xs">VITE_IOS_STORE_URL</code> and{" "}
            <code className="font-mono text-xs">VITE_ANDROID_STORE_URL</code> at build time and the
            store buttons appear above.
          </p>
        </div>
      )}

      <div className={infoCard}>
        <strong className="mb-1 block text-sm text-foreground">What a native shell needs</strong>
        <p className="m-0 text-sm leading-relaxed text-muted-foreground">
          If you want push notifications or a store listing, wrap this build in a WebView shell
          (Capacitor or React Native WebView) and point it at your deployment. The UI already
          handles the mobile breakpoints, safe-area insets and the software keyboard.
        </p>
      </div>
    </Page>
  );
}
