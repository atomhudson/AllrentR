import React, { useEffect } from 'react';

interface GoogleAdProps {
  slot: string;
  format?: string;
  responsive?: string;
  style?: React.CSSProperties;
  className?: string;
  layout?: string;
}

const GoogleAd: React.FC<GoogleAdProps> = ({ 
  slot, 
  format = "auto", 
  responsive = "true",
  style = { display: 'block' },
  className = "my-8",
  layout
}) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className={`ad-container flex justify-center w-full overflow-hidden ${className}`}>
      <ins 
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-5002603351055656"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
        {...(layout ? { 'data-ad-layout': layout } : {})}
      />
    </div>
  );
};

export default GoogleAd;
