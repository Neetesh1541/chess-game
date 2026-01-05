import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Handshake, X, Check } from 'lucide-react';

interface DrawOfferProps {
  isOffering: boolean;
  isReceiving: boolean;
  onOffer: () => void;
  onAccept: () => void;
  onDecline: () => void;
  disabled?: boolean;
}

const DrawOffer: React.FC<DrawOfferProps> = ({
  isOffering,
  isReceiving,
  onOffer,
  onAccept,
  onDecline,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <AnimatePresence mode="wait">
        {isReceiving ? (
          <motion.div
            key="receiving"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-3 rounded-lg bg-primary/10 border border-primary/30"
          >
            <p className="text-sm font-medium text-center mb-2">
              <Handshake className="w-4 h-4 inline mr-2" />
              Opponent offers a draw
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                className="flex-1 gap-1"
                onClick={onAccept}
              >
                <Check className="w-4 h-4" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1"
                onClick={onDecline}
              >
                <X className="w-4 h-4" />
                Decline
              </Button>
            </div>
          </motion.div>
        ) : isOffering ? (
          <motion.div
            key="offering"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-lg bg-secondary/50 text-center"
          >
            <Handshake className="w-5 h-5 mx-auto mb-1 text-primary animate-pulse" />
            <p className="text-sm text-muted-foreground">
              Draw offer sent...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="offer-button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={onOffer}
              disabled={disabled}
            >
              <Handshake className="w-4 h-4" />
              Offer Draw
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DrawOffer;