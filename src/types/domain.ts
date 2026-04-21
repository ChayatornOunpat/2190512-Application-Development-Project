export type Plate = string;

export type AuthUser = {
  uid: string;
  email: string | null;
};

export type WorkingRecord = {
  plate: Plate;
  working: boolean;
  rest1: boolean;
  rest2: boolean;
  destination: boolean;
  passRest1: boolean;
  passRest2: boolean;
  passDestination: boolean;
};

export type WorkingField = keyof Omit<WorkingRecord, 'plate'>;

export type PlateState = {
  active: boolean;
  user: string;
  refDate: string;
  usage: number;
};

export type CheckField =
  | 'law' | 'tax' | 'insurance' | 'passport'
  | 'headlight' | 'turnlight' | 'toplight'
  | 'lubeoil' | 'tankcoolant' | 'percipitation'
  | 'opsname' | 'doormirror'
  | 'tire' | 'tirehub' | 'tirehub2' | 'tirehub3' | 'tirehub4'
  | 'spare' | 'pressure' | 'extinguisher' | 'tiresupport' | 'cone'
  | 'breaklight' | 'reverselight' | 'backturnlight'
  | 'structuralintegrity' | 'fastener' | 'cover';

export type SessionBlob =
  & Record<CheckField, boolean>
  & Record<`${CheckField}_note`, string>
  & Record<`${CheckField}_fix`, string>
  & {
    alcohol: boolean;
    drug: boolean;
    plate: Plate;
    mile: string;
    date: string;
    name: string;
    startLocation: string;
  };

export type SessionListing = {
  name: string;
  url: string;
};