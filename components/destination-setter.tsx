'use client';

import { useEffect } from 'react';
import { destinationContext } from '@/lib/destination-context';

interface DestinationSetterProps {
  destination: string | null;
}

export function DestinationSetter({ destination }: DestinationSetterProps) {
  useEffect(() => {
    if (destination) {
      console.log('🎯 DestinationSetter: Setting destination:', destination);
      destinationContext.setDestinationDirect(destination);
      console.log('🎯 DestinationSetter: Destination set successfully');
    }
  }, [destination]);

  return null; // 这个组件不渲染任何内容，只负责设置目的地
}