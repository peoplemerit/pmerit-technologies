/**
 * UsageMeter Component Tests
 *
 * Tests usage display, progress bar, and color thresholds.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UsageMeter } from '../../src/components/UsageMeter';

describe('UsageMeter', () => {
  it('renders default "Requests" label', () => {
    render(<UsageMeter used={10} limit={100} />);
    expect(screen.getByText('Requests')).toBeInTheDocument();
  });

  it('renders custom label', () => {
    render(<UsageMeter used={10} limit={100} label="Code Tasks" />);
    expect(screen.getByText('Code Tasks')).toBeInTheDocument();
  });

  it('displays usage count as "used / limit"', () => {
    render(<UsageMeter used={25} limit={500} />);
    expect(screen.getByText('25 / 500')).toBeInTheDocument();
  });

  it('uses purple color when under 80% usage', () => {
    const { container } = render(<UsageMeter used={50} limit={100} />);
    const bar = container.querySelector('[style]');
    expect(bar?.className).toContain('bg-purple-500');
    expect(bar?.getAttribute('style')).toBe('width: 50%;');
  });

  it('uses yellow color at 80% usage (warning)', () => {
    const { container } = render(<UsageMeter used={80} limit={100} />);
    const bar = container.querySelector('[style]');
    expect(bar?.className).toContain('bg-yellow-500');
  });

  it('uses red color at 95% usage (critical)', () => {
    const { container } = render(<UsageMeter used={96} limit={100} />);
    const bar = container.querySelector('[style]');
    expect(bar?.className).toContain('bg-red-500');
  });

  it('caps bar width at 100% when over limit', () => {
    const { container } = render(<UsageMeter used={150} limit={100} />);
    const bar = container.querySelector('[style]');
    expect(bar?.getAttribute('style')).toBe('width: 100%;');
  });

  it('shows usage text in red at critical level', () => {
    render(<UsageMeter used={96} limit={100} />);
    const usageText = screen.getByText('96 / 100');
    expect(usageText.className).toContain('text-red-400');
  });

  it('shows usage text in yellow at warning level', () => {
    render(<UsageMeter used={85} limit={100} />);
    const usageText = screen.getByText('85 / 100');
    expect(usageText.className).toContain('text-yellow-400');
  });

  it('shows usage text in normal color under 80%', () => {
    render(<UsageMeter used={50} limit={100} />);
    const usageText = screen.getByText('50 / 100');
    expect(usageText.className).toContain('text-gray-300');
  });
});
