import React from 'react';
import styled from 'styled-components';

const YearFilterContainer = styled.div<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 180px;
  position: relative;
  padding: 0.5rem;
  border-radius: 6px;
  background-color: ${(props) =>
    props.isActive ? 'rgba(0, 102, 204, 0.1)' : 'transparent'};
  border: 1px solid ${(props) => (props.isActive ? '#0066cc' : 'transparent')};
  cursor: help;
`;

const YearFilterInput = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  background-color: white;
  color: #333;
  font-size: 0.9rem;
  width: 80px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #999;
    background-color: #f9f9f9;
  }

  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
  }
`;

const YearFilterSeparator = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const YearFilterActiveIndicator = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #0066cc;
`;

const YearFilterTooltip = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 250px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0.75rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: none;
  font-size: 0.8rem;
  color: #666;

  ${YearFilterContainer}:hover & {
    display: block;
  }
`;

interface YearFilterProps {
  startYear: string;
  endYear: string;
  onStartYearChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEndYearChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function YearFilterComponent({
  startYear,
  endYear,
  onStartYearChange,
  onEndYearChange,
}: YearFilterProps) {
  return (
    <YearFilterContainer isActive={!!(startYear || endYear)}>
      <YearFilterInput
        type="text"
        placeholder="From"
        value={startYear}
        onChange={onStartYearChange}
        maxLength={4}
      />
      <YearFilterSeparator>to</YearFilterSeparator>
      <YearFilterInput
        type="text"
        placeholder="To"
        value={endYear}
        onChange={onEndYearChange}
        maxLength={4}
      />
      {(startYear || endYear) && <YearFilterActiveIndicator />}
      <YearFilterTooltip>
        Filter players based on the year their matches took place. Leave empty
        to show all years.
      </YearFilterTooltip>
    </YearFilterContainer>
  );
}
