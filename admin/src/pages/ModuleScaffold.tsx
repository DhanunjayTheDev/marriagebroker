import React from 'react';
import { LucideIcon } from 'lucide-react';
import { PageHeader } from '../components/common';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui';

interface ModuleScaffoldProps {
  title: string;
  description: string;
  icon: LucideIcon;
  sections: Array<{ title: string; description: string; icon: LucideIcon }>;
}

/**
 * Styled operational module scaffold. Renders module sub-capabilities as cards.
 * Wire individual sections to their backend endpoints as they're implemented.
 */
export const ModuleScaffold: React.FC<ModuleScaffoldProps> = ({ title, description, icon: Icon, sections }) => (
  <div>
    <PageHeader title={title} description={description} />

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sections.map((s) => (
        <Card key={s.title} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent>
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-primary mb-3">
              <s.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold mb-1">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);
