import { cloudinary } from './cloudinary.test.mjs';
import { geometry } from './geometry.test.mjs';
import { pin } from './pin.test.mjs';

export const entries = {
  setup,
  pin,
  geometry,
  cloudinary,
};

function setup() {
  codi.describe(
    { name: 'Entries:', id: 'ui_locations_entries', parentId: 'ui_locations' },
    () => {},
  );
}
