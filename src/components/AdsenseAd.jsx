import { useEffect } from "react";

export default function AdsenseAd() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("Adsense error:", e);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-9776277179268943"
      data-ad-slot="5156629928"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
}
