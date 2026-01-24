// Tab navigator params
export type RootTabParamList = {
  HomeTab: undefined;
  DealsTab: undefined;
  BasketTab: undefined;
};

// Stack navigator params for Home tab
export type HomeStackParamList = {
  HomeMain: undefined;
  Category: { id: string };
};

// Stack navigator params for Deals tab
export type DealsStackParamList = {
  DealsMain: undefined;
  Category: { id: string };
};

// Stack navigator params for Basket tab
export type BasketStackParamList = {
  BasketMain: undefined;
};

// Legacy type for backwards compatibility
export type RootStackParamList = {
  Home: undefined;
  Category: { id: string };
  Basket: undefined;
};
