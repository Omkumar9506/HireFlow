import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/StatusBadge';
import { Settings, ShieldCheck, FileCode, CheckCircle2, ExternalLink } from 'lucide-react';

export const AdminSettingsPage = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          System Configuration & Developer Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Platform architecture parameters, Swagger OpenAPI specifications, and integration drivers.
        </p>
      </div>

      {/* OpenAPI Swagger Documentation */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Interactive OpenAPI 3.0 Documentation</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Explore and test all 30+ backend endpoints, schemas, parameters, and responses interactively.
            </p>
          </div>
          <a href="http://localhost:5000/api/docs" target="_blank" rel="noreferrer">
            <Button variant="primary" size="sm" icon={ExternalLink}>
              Launch Swagger UI
            </Button>
          </a>
        </div>
      </Card>

      {/* Service Integration Drivers */}
      <Card className="p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
          Service Driver Health & Fallback Subsystems
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <div>
              <span className="font-bold text-slate-900">Database Engine</span>
              <p className="text-[11px] text-slate-500">MongoDB v8.3.4 (Local & Atlas URI support)</p>
            </div>
            <Badge variant="success">Connected (Port 27017)</Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <div>
              <span className="font-bold text-slate-900">Artificial Intelligence Engine</span>
              <p className="text-[11px] text-slate-500">Google Gemini API (with deterministic heuristic fallback)</p>
            </div>
            <Badge variant="primary">Active (Heuristic Engine)</Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <div>
              <span className="font-bold text-slate-900">Resume & Media Storage</span>
              <p className="text-[11px] text-slate-500">Cloudinary SDK (with local disk /uploads fallback)</p>
            </div>
            <Badge variant="primary">Active (Local Fallback)</Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <div>
              <span className="font-bold text-slate-900">Email Dispatcher</span>
              <p className="text-[11px] text-slate-500">Nodemailer SMTP (with console dev transport fallback)</p>
            </div>
            <Badge variant="primary">Active (Console Fallback)</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
