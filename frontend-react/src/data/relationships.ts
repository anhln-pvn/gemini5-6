export type RelationshipType = 'oversight' | 'management' | 'routing' | 'portfolio' | 'strategy';

export interface Relationship {
  source: string;
  target: string;
  type: RelationshipType;
}

export const RELATIONSHIPS: Relationship[] = [
  { source: 'lmhung', target: 'le_ngoc_son', type: 'oversight' },
  { source: 'lnson', target: 'le_ngoc_son', type: 'oversight' },
  { source: 'bmtien', target: 'le_ngoc_son', type: 'oversight' },
  { source: 'nvmau', target: 'le_ngoc_son', type: 'oversight' },
  { source: 'tbminh', target: 'le_ngoc_son', type: 'oversight' },
  { source: 'ptanh', target: 'le_ngoc_son', type: 'oversight' },
  { source: 'thnam', target: 'le_ngoc_son', type: 'oversight' },

  { source: 'le_ngoc_son', target: 'do_chi_thanh', type: 'management' },
  { source: 'le_ngoc_son', target: 'duong_manh_son', type: 'management' },
  { source: 'le_ngoc_son', target: 'le_xuan_huyen', type: 'management' },
  { source: 'le_ngoc_son', target: 'phan_tu_giang', type: 'management' },
  { source: 'le_ngoc_son', target: 'le_manh_cuong', type: 'management' },

  { source: 'vp', target: 'do_chi_thanh', type: 'routing' },
  { source: 'vp', target: 'duong_manh_son', type: 'routing' },
  { source: 'vp', target: 'le_xuan_huyen', type: 'routing' },
  { source: 'vp', target: 'phan_tu_giang', type: 'routing' },
  { source: 'vp', target: 'le_manh_cuong', type: 'routing' },
  { source: 'vp', target: 'le_ngoc_son', type: 'routing' },

  { source: 'do_chi_thanh', target: 'ttvhdn', type: 'portfolio' },
  { source: 'do_chi_thanh', target: 'pcdt', type: 'portfolio' },
  { source: 'do_chi_thanh', target: 'qtnnl', type: 'portfolio' },
  { source: 'do_chi_thanh', target: 'knsb', type: 'portfolio' },
  { source: 'do_chi_thanh', target: 'qtrr', type: 'portfolio' },

  { source: 'duong_manh_son', target: 'tckt', type: 'portfolio' },
  { source: 'duong_manh_son', target: 'qtrr', type: 'portfolio' },
  { source: 'duong_manh_son', target: 'ktdt', type: 'portfolio' },
  { source: 'duong_manh_son', target: 'qlhd', type: 'portfolio' },

  { source: 'le_xuan_huyen', target: 'cnklhd', type: 'portfolio' },
  { source: 'le_xuan_huyen', target: 'tmdv', type: 'portfolio' },
  { source: 'le_xuan_huyen', target: 'khcncds', type: 'portfolio' },
  { source: 'le_xuan_huyen', target: 'atmt', type: 'portfolio' },

  { source: 'phan_tu_giang', target: 'dnltt', type: 'portfolio' },
  { source: 'phan_tu_giang', target: 'atmt', type: 'portfolio' },
  { source: 'phan_tu_giang', target: 'khcncds', type: 'portfolio' },
  { source: 'phan_tu_giang', target: 'tmdv', type: 'portfolio' },

  { source: 'le_manh_cuong', target: 'tdkt', type: 'portfolio' },
  { source: 'le_manh_cuong', target: 'qlhd', type: 'portfolio' },
  { source: 'le_manh_cuong', target: 'tmdv', type: 'portfolio' },
  { source: 'le_manh_cuong', target: 'khcncds', type: 'portfolio' },
  { source: 'le_manh_cuong', target: 'atmt', type: 'portfolio' },

  { source: 'le_ngoc_son', target: 'qtnnl', type: 'strategy' },
  { source: 'le_ngoc_son', target: 'ktdt', type: 'strategy' },
  { source: 'le_ngoc_son', target: 'qtrr', type: 'strategy' },
  { source: 'le_ngoc_son', target: 'tdkt', type: 'strategy' },
  { source: 'le_ngoc_son', target: 'qlhd', type: 'strategy' },
  { source: 'le_ngoc_son', target: 'cnklhd', type: 'strategy' },
  { source: 'le_ngoc_son', target: 'dnltt', type: 'strategy' },
  { source: 'le_ngoc_son', target: 'khcncds', type: 'strategy' },
  { source: 'le_ngoc_son', target: 'atmt', type: 'strategy' },
  { source: 'le_ngoc_son', target: 'tmdv', type: 'strategy' },
  { source: 'le_ngoc_son', target: 'tckt', type: 'strategy' },
  { source: 'le_ngoc_son', target: 'pcdt', type: 'strategy' },
  { source: 'le_ngoc_son', target: 'ttvhdn', type: 'strategy' },
  { source: 'le_ngoc_son', target: 'cl', type: 'strategy' },
  { source: 'le_ngoc_son', target: 'knsb', type: 'strategy' },
  { source: 'le_ngoc_son', target: 'th', type: 'strategy' },
];
