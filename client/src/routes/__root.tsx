import React, { Suspense } from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { IncomingCallOverlay } from '../components/calls/IncomingCallOverlay';
import { GlobalLoadingBar } from '../components/common/GlobalLoadingBar';

export const Route = createRootRoute({
  component: () => (
    <>
      <GlobalLoadingBar />
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
      <IncomingCallOverlay />
    </>
  ),
});
