import React, { useEffect } from 'react';
import styled from 'styled-components';

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterDropdown = styled.div`
  position: relative;
  min-width: 180px;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  background-color: white;
  color: #333;
  cursor: pointer;
  font-size: 0.9rem;
  width: 100%;
  transition: all 0.2s ease;

  &:hover {
    border-color: #999;
    background-color: #f9f9f9;
  }

  &:after {
    content: '';
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #666;
    margin-left: 8px;
    transition: transform 0.2s ease;
  }

  &.open:after {
    transform: rotate(180deg);
  }
`;

const FilterMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: ${(props) => (props.isOpen ? '300px' : '0')};
  overflow-y: auto;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  visibility: ${(props) => (props.isOpen ? 'visible' : 'hidden')};
  transition: all 0.2s ease;
`;

const FilterOption = styled.label`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
  }

  input {
    margin-right: 8px;
  }
`;

const FilterTextInputContainer = styled.div`
  padding: 0.5rem 1rem;
`;

const FilterTextInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
  }
`;

const FilterBadge = styled.span`
  background-color: #0066cc;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.75rem;
  margin-left: 8px;
`;

const ClearFiltersButton = styled.button`
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  background-color: white;
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
    border-color: #999;
    color: #333;
  }

  &:active {
    background-color: #e5e5e5;
  }
`;

interface FilterDropdownProps<T extends string> {
  label: string;
  options: T[];
  selectedValues: T[];
  onChange: (value: T) => void;
  isOpen: boolean;
  onToggle: () => void;
  allowTextInput?: boolean;
  onTextInputChange?: (value: string) => void;
  textInputValue?: string;
}

export function FilterDropdownComponent<T extends string>({
  label,
  options,
  selectedValues,
  onChange,
  isOpen,
  onToggle,
  allowTextInput = false,
  onTextInputChange,
  textInputValue = '',
}: FilterDropdownProps<T>) {
  return (
    <FilterDropdown className="filter-dropdown">
      <FilterButton className={isOpen ? 'open' : ''} onClick={onToggle}>
        {label}{' '}
        {selectedValues.length > 0 && (
          <FilterBadge>{selectedValues.length}</FilterBadge>
        )}
      </FilterButton>
      <FilterMenu isOpen={isOpen}>
        {allowTextInput && (
          <FilterTextInputContainer>
            <FilterTextInput
              type="text"
              placeholder={`Filter by ${label.toLowerCase()}...`}
              value={textInputValue}
              onChange={(e) =>
                onTextInputChange && onTextInputChange(e.target.value)
              }
              onClick={(e) => e.stopPropagation()}
            />
          </FilterTextInputContainer>
        )}
        {options.map((option) => (
          <FilterOption key={option}>
            <input
              type="checkbox"
              checked={selectedValues.includes(option)}
              onChange={() => onChange(option)}
            />
            {option}
          </FilterOption>
        ))}
      </FilterMenu>
    </FilterDropdown>
  );
}

interface FilterContainerProps {
  children: React.ReactElement | React.ReactElement[];
}

export function FilterContainerComponent({ children }: FilterContainerProps) {
  return <FilterContainer>{children}</FilterContainer>;
}

export function ClearFiltersButtonComponent({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <ClearFiltersButton onClick={onClick}>Clear Filters</ClearFiltersButton>
  );
}

export function useFilterDropdown<T extends string>(
  options: T[],
  initialValues: T[] = []
) {
  const [selectedValues, setSelectedValues] =
    React.useState<T[]>(initialValues);
  const [openFilter, setOpenFilter] = React.useState<string | null>(null);

  const handleCheckboxChange = (value: T) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((v) => v !== value));
    } else {
      setSelectedValues([...selectedValues, value]);
    }
  };

  const toggleFilter = (filterName: string) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  const closeAllFilters = () => {
    setOpenFilter(null);
  };

  const clearFilters = () => {
    setSelectedValues([]);
  };

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openFilter &&
        !(event.target as Element).closest('.filter-dropdown')
      ) {
        closeAllFilters();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openFilter]);

  return {
    selectedValues,
    setSelectedValues,
    openFilter,
    toggleFilter,
    closeAllFilters,
    clearFilters,
    handleCheckboxChange,
  };
}
