import { PreviewInfoCard, PreviewInfoRow, PreviewInfoLabel, PreviewInfoCount, PreviewInfoTitle, PreviewInfoActions } from './preview-info-card'
import { Button } from './button'

const Card = ({ disabled = false, long = false }) => (
 <div className="relative h-48">
  <PreviewInfoCard>
   <PreviewInfoRow><PreviewInfoLabel>{long ? 'A long section name that must not displace the counter' : 'Section'}</PreviewInfoLabel><PreviewInfoCount>1/3</PreviewInfoCount></PreviewInfoRow>
   <PreviewInfoTitle>Template preview</PreviewInfoTitle>
   <PreviewInfoActions><Button isDisabled={disabled}>Open editor</Button></PreviewInfoActions>
  </PreviewInfoCard>
 </div>
)
export const examples = {
 default: () => <Card />,
 variants: () => <Card long />,
 states: () => <Card disabled />,
}
export const meta = { category: 'Composite', description: 'Domain-free preview information overlay with original Manager spacing. Navigation and workflow actions are supplied by the consumer.' }
