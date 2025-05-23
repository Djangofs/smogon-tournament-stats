import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
`;

export const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  animation: ${slideUp} 0.3s ease-out;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
`;

export const StyledCloseButton = styled.button.attrs({ type: 'button' })`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  line-height: 1;

  &:hover {
    color: #333;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

export const StyledLabel = styled.label`
  font-weight: 500;
  color: #333;
`;

export const StyledInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #0066cc;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const StyledCheckbox = styled.input.attrs({ type: 'checkbox' })`
  width: 1rem;
  height: 1rem;
  cursor: pointer;
`;

export const StyledSubmitButton = styled.button.attrs({ type: 'submit' })`
  background-color: #0066cc;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;

  &:hover {
    background-color: #0052a3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const StyledSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #0066cc;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    sheetName: string;
    sheetId: string;
    isOfficial: boolean;
    isTeam: boolean;
    year: number;
    replayPostUrl?: string;
    replaySource: 'thread' | 'embedded' | 'none';
    transformer?: string;
  }) => void;
  isLoading?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: ModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      name: formData.get('name') as string,
      sheetName: formData.get('sheetName') as string,
      sheetId: formData.get('sheetId') as string,
      isOfficial: formData.get('isOfficial') === 'true',
      isTeam: formData.get('isTeam') === 'true',
      year: parseInt(formData.get('year') as string),
      replayPostUrl: (formData.get('replayPostUrl') as string) || undefined,
      replaySource:
        (formData.get('replaySource') as 'thread' | 'embedded' | 'none') ||
        'none',
      transformer: (formData.get('transformer') as string) || undefined,
    });
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Import Tournament</ModalTitle>
          <StyledCloseButton onClick={onClose} disabled={isLoading}>
            &times;
          </StyledCloseButton>
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <StyledLabel htmlFor="name">Tournament Name</StyledLabel>
            <StyledInput
              type="text"
              id="name"
              name="name"
              required
              placeholder="e.g., Smogon Tour 35"
              disabled={isLoading}
            />
          </FormGroup>
          <FormGroup>
            <StyledLabel htmlFor="year">Year</StyledLabel>
            <StyledInput
              type="number"
              id="year"
              name="year"
              required
              min="2000"
              max="2100"
              placeholder="e.g., 2024"
              disabled={isLoading}
            />
          </FormGroup>
          <FormGroup>
            <StyledLabel htmlFor="sheetName">Google Sheet Name</StyledLabel>
            <StyledInput
              type="text"
              id="sheetName"
              name="sheetName"
              required
              placeholder="e.g., Sheet1"
              disabled={isLoading}
            />
          </FormGroup>
          <FormGroup>
            <StyledLabel htmlFor="sheetId">Google Sheet ID</StyledLabel>
            <StyledInput
              type="text"
              id="sheetId"
              name="sheetId"
              required
              placeholder="e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              disabled={isLoading}
            />
          </FormGroup>
          <FormGroup>
            <StyledLabel htmlFor="replaySource">Replay Source</StyledLabel>
            <StyledSelect
              id="replaySource"
              name="replaySource"
              disabled={isLoading}
              defaultValue="none"
            >
              <option value="none">No Replays Available</option>
              <option value="thread">Replays in Separate Thread</option>
              <option value="embedded">Replays Embedded in Sheet</option>
            </StyledSelect>
          </FormGroup>
          <FormGroup>
            <StyledLabel htmlFor="transformer">Data Transformer</StyledLabel>
            <StyledSelect
              id="transformer"
              name="transformer"
              disabled={isLoading}
            >
              <option value="">Default Transformer</option>
              <option value="legacy">Legacy Transformer</option>
              <option value="modern">Modern Transformer</option>
              <option value="spl-middle">SPL Middle Transformer</option>
            </StyledSelect>
          </FormGroup>
          <FormGroup>
            <StyledLabel htmlFor="replayPostUrl">Replay Post URL</StyledLabel>
            <StyledInput
              type="url"
              id="replayPostUrl"
              name="replayPostUrl"
              placeholder="e.g., https://www.smogon.com/forums/threads/tournament-replays.123456"
              disabled={isLoading}
            />
          </FormGroup>
          <FormGroup>
            <CheckboxLabel>
              <StyledCheckbox
                name="isOfficial"
                value="true"
                disabled={isLoading}
              />
              Official Tournament
            </CheckboxLabel>
          </FormGroup>
          <FormGroup>
            <CheckboxLabel>
              <StyledCheckbox name="isTeam" value="true" disabled={isLoading} />
              Team Tournament
            </CheckboxLabel>
          </FormGroup>
          <StyledSubmitButton disabled={isLoading}>
            {isLoading ? 'Importing...' : 'Import Tournament'}
          </StyledSubmitButton>
        </form>
      </ModalContent>
    </Overlay>
  );
}
