interface StoreLogoProps {
  storeId: string;
  className?: string;
}

const storeLogos: Record<string, string> = {
  'maxi': '/maxi.svg',
  'iga': '/iga.svg',
  'provigo': '/provigo.svg',
  'walmart': '/walmart.svg',
  'metro': '/metro.png',
};

const storeNames: Record<string, string> = {
  'maxi': 'Maxi',
  'iga': 'IGA',
  'provigo': 'Provigo',
  'walmart': 'Walmart',
  'metro': 'Metro',
};

// Individual heights to make logos appear visually equal
const storeHeights: Record<string, string> = {
  'maxi': '18px',
  'iga': '20px',
  'provigo': '18px',
  'walmart': '18px',
  'metro': '16px',
};

export default function StoreLogo({ storeId, className = '' }: StoreLogoProps) {
  const logo = storeLogos[storeId];
  const name = storeNames[storeId] || storeId;
  const height = storeHeights[storeId] || '18px';

  if (!logo) {
    return <span>{name}</span>;
  }

  return (
    <img
      src={logo}
      alt={name}
      style={{ height }}
      className={`inline-block align-middle w-auto ${className}`}
    />
  );
}
