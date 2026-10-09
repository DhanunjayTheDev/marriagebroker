import { createFileRoute } from '@tanstack/react-router';
import { RelationshipAdvicePage } from '../../pages/public/RelationshipAdvicePage';

export const Route = createFileRoute('/relationship-advice/')({
  component: RelationshipAdvicePage,
});
