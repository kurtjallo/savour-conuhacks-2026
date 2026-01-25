interface StoreLogoProps {
  storeId: string;
  className?: string;
}

const storeLogos: Record<string, string> = {
  'no-frills': '/nofrills.png',
  'nofrills': '/nofrills.png',
  'freshco': '/freshco-seeklogo.png',
  'walmart': '/walmart.svg',
  'loblaws': '/loblaws.png',
  'metro': '/metro.png',
};

const storeNames: Record<string, string> = {
  'no-frills': 'No Frills',
  'nofrills': 'No Frills',
  'freshco': 'FreshCo',
  'walmart': 'Walmart',
  'loblaws': 'Loblaws',
  'metro': 'Metro',
};

// Individual heights to make logos appear visually equal
const storeHeights: Record<string, string> = {
  'no-frills': '14px',
  'nofrills': '14px',
  'freshco': '20px',
  'walmart': '18px',
  'loblaws': '18px',
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
