import React from 'react';

const PricingSection: React.FC = () => {
  const plans = [
    { name: 'Basic', price: '$9/mo', features: ['Core features', 'Email support'] },
    { name: 'Pro', price: '$29/mo', features: ['Everything in Basic', 'Advanced analytics', 'Priority support'] },
    { name: 'Enterprise', price: 'Contact us', features: ['Custom integrations', 'Dedicated support', 'SLAs'] },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-8">Pricing Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => (
            <div key={idx} className="p-6 border rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-2xl font-bold mb-4">{plan.price}</p>
              <ul className="mb-4 text-gray-600">
                {plan.features.map((f, i) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;