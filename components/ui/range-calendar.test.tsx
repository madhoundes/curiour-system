import { render, screen, fireEvent } from '@testing-library/react';
import { RangeCalendar } from './range-calendar';

// Mock the Calendar component
jest.mock('./calendar', () => ({
  Calendar: ({ onSelect, selected, ...props }: any) => (
    <div data-testid="calendar" onClick={() => onSelect?.({ from: new Date('2025-01-01'), to: new Date('2025-01-07') })}>
      Calendar Component
    </div>
  )
}));

// Mock the Popover component
jest.mock('./popover', () => ({
  Popover: ({ children, open, onOpenChange }: any) => (
    <div data-testid="popover" onClick={() => onOpenChange?.(!open)}>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children, asChild }: any) => (
    <div data-testid="popover-trigger">
      {children}
    </div>
  ),
  PopoverContent: ({ children }: any) => (
    <div data-testid="popover-content">
      {children}
    </div>
  )
}));

describe('RangeCalendar', () => {
  it('renders with placeholder text', () => {
    render(<RangeCalendar />);
    expect(screen.getByText('Pick a date range')).toBeInTheDocument();
  });

  it('displays selected date range correctly', () => {
    const dateRange = {
      from: new Date('2025-01-01'),
      to: new Date('2025-01-07')
    };
    
    render(<RangeCalendar dateRange={dateRange} />);
    expect(screen.getByText('Jan 01, 2025 - Jan 07, 2025')).toBeInTheDocument();
  });

  it('calls onDateRangeChange when date range is selected', () => {
    const mockOnDateRangeChange = jest.fn();
    render(<RangeCalendar onDateRangeChange={mockOnDateRangeChange} />);
    
    const trigger = screen.getByTestId('popover-trigger');
    fireEvent.click(trigger);
    
    const calendar = screen.getByTestId('calendar');
    fireEvent.click(calendar);
    
    expect(mockOnDateRangeChange).toHaveBeenCalledWith({
      from: new Date('2025-01-01'),
      to: new Date('2025-01-07')
    });
  });

  it('applies custom className', () => {
    const { container } = render(<RangeCalendar className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<RangeCalendar id="test-range-calendar" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Select date range');
    expect(button).toHaveAttribute('id', 'test-range-calendar');
  });
});
