import * as builder from 'electron-builder';

builder.build({
  config: {
    mac: {
      icon: 'assets/icon.png',
    },
  },
});
