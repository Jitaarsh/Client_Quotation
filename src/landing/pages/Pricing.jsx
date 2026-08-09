import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react';
import { getPlans } from '../../api/planApi';
import Footer from '../components/Footer';

const permissionItems = [
  { key: 'emailSupport', label: 'Email Support' },
  { key: 'pdfExport', label: 'PDF Export' },
  { key: 'advancedPdfExport', label: 'Advanced PDF Export' },
  { key: 'customBranding', label: 'Custom Branding' },
  { key: 'apiAccess', label: 'API Access' },
  { key: 'prioritySupport', label: 'Priority Support' },
];

const getCurrencySymbol = (currency) =>
  currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency;

const formatBillingCycle = (billingCycle) => {
  if (!billingCycle) return '';
  return billingCycle === 'monthly' ? 'month' : billingCycle === 'yearly' ? 'year' : billingCycle;
};

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        setLoadError('');
        const response = await getPlans();
        if (response.success) {
          setPlans(response.data);
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
        setLoadError('Pricing plans could not be loaded right now. Please try again shortly.');
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafcff] font-sans overflow-x-hidden flex flex-col">
      <main className="flex-1">
        <section className="px-6 py-16 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-6xl text-center">
            <span className="text-xs font-black uppercase tracking-widest text-[#145be9]">
              Pricing
            </span>
            <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight text-[#1a2b4b] sm:text-5xl lg:text-6xl">
              Choose a plan that fits how your team quotes.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-slate-500 sm:text-lg">
              Start with the right quotation limits, templates, exports, and support level for your business.
            </p>
          </div>
        </section>

        <section className="border-y border-gray-100 bg-white px-6 py-14 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {loadingPlans ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-gray-100 bg-[#f8fbff] py-20 shadow-inner">
                <div className="relative">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-100 border-t-[#145be9]" />
                  <Zap className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-pulse text-[#145be9]" />
                </div>
                <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Loading Plans...
                </p>
              </div>
            ) : loadError ? (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{loadError}</span>
              </div>
            ) : plans.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                  <Zap className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-lg font-bold text-gray-500">No active plans available</p>
                <p className="text-sm text-gray-400">Please contact support for registration.</p>
              </div>
            ) : (
              <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan, index) => {
                  const isPopular = index === 1;
                  const symbol = getCurrencySymbol(plan.currency);
                  const hasDiscount = Number(plan.discountPercent) > 0;
                  const displayPrice = hasDiscount ? plan.discountedPrice ?? plan.price : plan.price;
                  const registerPath = plan._id ? `/register?plan=${plan._id}` : '/register';

                  return (
                    <article
                      key={plan._id}
                      className={`group relative flex h-full flex-col rounded-lg bg-white p-8 transition-all duration-300 hover:-translate-y-2 ${
                        isPopular
                          ? 'border-2 border-[#145be9] shadow-[0_20px_50px_rgba(20,91,233,0.15)]'
                          : 'border-2 border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-xl'
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#145be9] px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/30">
                          Popular
                        </div>
                      )}

                      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 text-[#145be9] transition-transform duration-300 group-hover:scale-110">
                        {plan.name?.toLowerCase().includes('starter') ? <Zap className="h-7 w-7" /> : <Building2 className="h-7 w-7" />}
                      </div>

                      <h2 className="text-2xl font-black text-[#1a2b4b]">{plan.name}</h2>
                      <p className="mt-3 min-h-12 text-sm font-medium leading-6 text-slate-500">
                        {plan.shortDescription || 'A focused plan for creating and managing professional quotations.'}
                      </p>

                      <div className="mt-8">
                        <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                          <span className="text-5xl font-black tracking-tight text-[#1a2b4b]">
                            {symbol}{displayPrice}
                          </span>
                          <span className="pb-1 text-sm font-bold text-gray-400">
                            /{formatBillingCycle(plan.billingCycle)}
                          </span>
                        </div>
                        {hasDiscount && (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-bold">
                            <span className="text-gray-400 line-through">{symbol}{plan.price}</span>
                            <span className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] uppercase tracking-wider text-[#145be9]">
                              {plan.discountPercent}% off
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-8 space-y-3 border-t border-gray-100 pt-6">
                        {(plan.features?.length ? plan.features : ['Standard quotation tools']).map((feature, i) => (
                          <div key={i} className="flex items-start gap-3 text-left">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </span>
                            <span className="text-sm font-bold leading-6 text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 rounded-lg bg-[#f8fbff] p-5">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1a2b4b]">
                          Limitations
                        </h3>
                        <div className="mt-4 grid gap-3 text-sm font-bold text-gray-600">
                          <div>{plan.limitations?.numberOfQuotations ?? 0} quotations/month</div>
                          <div>{plan.limitations?.numberOfTemplates ?? 0} templates</div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1a2b4b]">
                          Permissions
                        </h3>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {permissionItems.map(({ key, label }) => {
                            const enabled = Boolean(plan.permissions?.[key]);
                            return (
                              <span
                                key={key}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${
                                  enabled ? 'bg-blue-50 text-[#145be9]' : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                {enabled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <Link
                        to={registerPath}
                        className={`mt-8 inline-flex w-full items-center justify-center rounded-lg px-6 py-3.5 text-sm font-black uppercase tracking-widest transition-all ${
                          isPopular
                            ? 'bg-[#145be9] text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700'
                            : 'bg-[#1a2b4b] text-white hover:bg-[#145be9]'
                        }`}
                      >
                        Get Started
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="px-6 py-14 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-lg bg-[#1a2b4b] p-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-black text-white">
                Ready to make every quote easier to send?
              </h2>
              <p className="mt-2 text-sm font-medium leading-6 text-blue-100">
                Register your company and start with the plan that matches your monthly workflow.
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#145be9] px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-105 hover:bg-blue-700"
            >
              Register
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
