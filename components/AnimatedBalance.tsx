import { useEffect, useRef, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../utils/currency';

interface Props {
  value: number;
  color: string;
  style?: object;
}

export function AnimatedBalance({ value, color, style }: Props) {
  const [displayed, setDisplayed] = useState(value);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(value);
  const duration = 500;

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    startRef.current = null;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    function step(timestamp: number) {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(from + (to - from) * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    }

    frameRef.current = requestAnimationFrame(step);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [value]);

  const sign = displayed >= 0 ? '+' : '';

  return (
    <Text style={[styles.amount, { color }, style]}>
      {sign}{formatCurrency(displayed)}
    </Text>
  );
}

const styles = StyleSheet.create({
  amount: { fontSize: 36, fontWeight: '800' },
});
