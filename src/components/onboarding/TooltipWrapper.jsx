import React from 'react';
import { base44 } from '@/api/base44Client';
import FeatureTooltip from './FeatureTooltip';
import TOOLTIPS_CONFIG, { useTooltip } from './ContextualTooltips';

export default function TooltipWrapper({ 
  children, 
  tooltipId, 
  user, 
  position = 'bottom',
  wrapperClassName = 'relative inline-block'
}) {
  const shouldShow = useTooltip(tooltipId, user);
  const config = TOOLTIPS_CONFIG[tooltipId];

  const handleDismiss = async () => {
    if (user?.email) {
      await base44.auth.updateMe({
        tooltip_dismissals: {
          ...(user.tooltip_dismissals || {}),
          [tooltipId]: true,
        },
      });
    }
  };

  if (!config) return children;

  return (
    <div className={wrapperClassName}>
      {children}
      {shouldShow && (
        <FeatureTooltip
          id={config.id}
          title={config.title}
          description={config.description}
          position={position}
          show={shouldShow}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
}