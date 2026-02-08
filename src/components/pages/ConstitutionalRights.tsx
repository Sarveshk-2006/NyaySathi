import React from 'react';
import { PageContainer } from '../layout/PageContainer';
import { Card } from '../shared';
import constitutionalRightsDataSource from '../../data/constitutional-rights.json';

const constitutionalRightsData = constitutionalRightsDataSource || [];

const ConstitutionalRights = () => (
  <PageContainer title="Constitutional Rights" subtitle="Know your fundamental rights.">
    <div className="grid md:grid-cols-2 gap-8">
      {constitutionalRightsData.flatMap(c => c.rights).map((r: any, i: number) => (
        <Card key={i} className="p-8 hover:shadow-2xl transition-all group border-t-0 border-b-4 border-b-transparent hover:border-b-amber-500">
          <h3 className="font-bold text-slate-900 text-xl mb-4 group-hover:text-slate-700 transition-colors">{r.title}</h3>
          <p className="text-slate-600 text-base leading-relaxed line-clamp-3">{r.description}</p>
        </Card>
      ))}
    </div>
  </PageContainer>
);

export default ConstitutionalRights;
