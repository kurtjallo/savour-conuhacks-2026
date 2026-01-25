const stores = [
  { name: 'Super C', logo: '/superc.png' },
  { name: 'Maxi', logo: '/maxi.png' },
  { name: 'IGA', logo: '/iga.svg' },
  { name: 'Provigo', logo: '/provigo.png' },
  { name: 'Walmart', logo: '/walmart.svg' },
  { name: 'Metro', logo: '/metro.png' },
];

export default function StoreLogoCarousel() {
  // Duplicate the array to create seamless infinite scroll
  const duplicatedStores = [...stores, ...stores];

  return (
    <div className="w-full overflow-hidden py-4">
      <p
        className="text-center text-sm text-muted mb-4"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        Compare prices from
      </p>
      <div className="relative">
        <div
          className="flex items-center gap-16 animate-scroll"
          style={{
            width: 'max-content',
          }}
        >
          {duplicatedStores.map((store, index) => (
            <div
              key={`${store.name}-${index}`}
              className="flex-shrink-0 flex items-center justify-center"
              style={{ minWidth: '120px' }}
            >
              <img
                src={store.logo}
                alt={store.name}
                className="h-10 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
