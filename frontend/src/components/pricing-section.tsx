"use client"

import { useState } from "react"

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true)

  const plans = [
    {
      name: "Starter",
      description: "Perfect for trying out the platform",
      monthlyPrice: "FREE",
      annualMonthlyPrice: "FREE",
             features: [
         "3 pins",
         "every 15 minutes", 
         "Basic templates"
       ]
    },
    {
      name: "Hobby", 
      description: "For personal projects and side hustles",
      monthlyPrice: "$7/mo",
      annualMonthlyPrice: "$5/mo",
             features: [
         "15 pins",
         "1 pinboard",
         "once a minute",
         "Custom templates",
         "AI document intelligence"
       ]
    },
    {
      name: "Professional",
      description: "For individual professionals", 
      monthlyPrice: "$15/mo",
      annualMonthlyPrice: "$12.50/mo",
                     features: [
          "50 pins",
          "5 pinboards",
          "Live updates",
          "Full API access",
          "AI document intelligence",
          "AI research"
        ],
      featured: true
    },
         {
       name: "Startups",
       description: "For teams and organizations",
       monthlyPrice: "$79/mo", 
       annualMonthlyPrice: "$50/mo",
                        features: [
           "200 pins",
           "20 pinboards",
           "Live updates",
           "Full API access",
           "AI document intelligence",
           "AI research",
           "Team collaboration",
           "Admin controls",
           "SSO",
           "Language translation"
         ]
     },
         {
       name: "Social Media",
       description: "For agencies and content creators",
       monthlyPrice: "$149/mo", 
       annualMonthlyPrice: "$99/mo",
                        features: [
           "1,000+ pins",
           "100 pinboards",
           "Live updates",
           "Full API access",
           "AI document intelligence",
           "AI research",
           "Content scheduling",
           "White-label reports",
           "Client management",
           "Analytics dashboard",
           "Language translation"
         ]
     }
  ]

        return (
    <div className="w-full">
      <h2 className="text-xl sm:text-2xl font-medium text-center mb-6 sm:mb-8">
        {isAnnual ? "Annual Pricing" : "Monthly Pricing"}
      </h2>
      
      {/* Billing Toggle */}
      <div className="flex justify-center mb-8 sm:mb-12">
        <div className="relative inline-flex items-center p-1 bg-muted/50 rounded-lg">
          <button
            onClick={() => setIsAnnual(false)}
            className={`relative px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium cursor-pointer rounded-md transition-all ${
              !isAnnual 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`relative px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium cursor-pointer rounded-md transition-all ${
              isAnnual 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Annually
            <span className="ml-1 text-xs text-green-600 font-semibold hidden sm:inline">Save up to 37%</span>
          </button>
        </div>
      </div>

      {/* Mobile Cards Layout */}
      <div className="block lg:hidden space-y-3">
        {plans.map((plan) => (
          <div key={plan.name} className={`border border-border/50 rounded-lg p-4 ${plan.featured ? 'bg-muted/20 border-primary/20' : 'bg-background'}`}>
            {plan.featured && (
              <div className="flex justify-center mb-2">
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                  Recommended
                </span>
              </div>
            )}
            
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">{plan.description}</p>
              <div className="text-2xl font-mono font-bold">
                {isAnnual ? plan.annualMonthlyPrice : plan.monthlyPrice}
              </div>
              {isAnnual && plan.annualMonthlyPrice !== "FREE" && (
                <div className="text-xs text-muted-foreground">
                  paid annually
                </div>
              )}
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-medium">Pins:</span>
                <span>{plan.features.find(f => f.includes('pins'))?.replace(' pins', '') || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Pinboards:</span>
                <span>{plan.features.find(f => f.includes('pinboard'))?.replace(' pinboard', '').replace('s', '') || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Updates:</span>
                <span>{plan.features.find(f => f.includes('update') || f.includes('Live') || f.includes('once')) || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">API Access:</span>
                <span>{plan.features.find(f => f.includes('API')) || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Document Intelligence:</span>
                <span>{plan.features.find(f => f.includes('document intelligence')) || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Research:</span>
                <span>{plan.features.find(f => f.includes('research')) || '-'}</span>
              </div>
              
              <div className="pt-2 border-t border-border/30">
                <div className="font-medium mb-1">Additional Features:</div>
                <div className="space-y-0.5">
                  {plan.features
                    .filter(f => !f.includes('pins') && !f.includes('pinboard') && !f.includes('update') && !f.includes('API') && !f.includes('document intelligence') && !f.includes('research'))
                    .map((feature, index) => (
                      <div key={index} className="text-muted-foreground flex items-center">
                        <span className="w-0.5 h-0.5 bg-muted-foreground rounded-full mr-1.5"></span>
                        {feature}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden lg:block overflow-x-auto pt-8 -mx-4 px-4">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left p-2 sm:p-4 font-medium text-muted-foreground text-sm sm:text-base">Plan</th>
                             <th className="text-center p-2 sm:p-4 font-medium text-muted-foreground text-sm sm:text-base">Starter</th>
               <th className="text-center p-2 sm:p-4 font-medium text-muted-foreground text-sm sm:text-base">Hobby</th>
               <th className="text-center p-2 sm:p-4 font-medium text-muted-foreground bg-muted/20 relative text-sm sm:text-base">
                 Professional
                 <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                   <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                     Recommended
                   </span>
                 </div>
               </th>
               <th className="text-center p-2 sm:p-4 font-medium text-muted-foreground text-sm sm:text-base">Startups</th>
               <th className="text-center p-2 sm:p-4 font-medium text-muted-foreground text-sm sm:text-base">Social Media</th>
            </tr>
          </thead>
          <tbody>
            {/* Price Row */}
            <tr className="border-b border-border/30">
              <td className="p-2 sm:p-4 font-medium text-sm sm:text-base">Price</td>
              {plans.map((plan) => (
                <td key={plan.name} className={`text-center p-2 sm:p-4 ${plan.featured ? 'bg-muted/20' : ''}`}>
                  <div className="text-base sm:text-lg font-mono font-medium">
                    {isAnnual ? plan.annualMonthlyPrice : plan.monthlyPrice}
                  </div>
                  {isAnnual && plan.annualMonthlyPrice !== "FREE" && (
                    <div className="text-xs text-muted-foreground/70 mt-1">
                      paid annually
                    </div>
                  )}
                </td>
              ))}
            </tr>
            
            {/* Pins Row */}
            <tr className="border-b border-border/30">
              <td className="p-2 sm:p-4 font-medium text-sm sm:text-base">Pins</td>
              {plans.map((plan) => (
                <td key={plan.name} className={`text-center p-2 sm:p-4 text-sm sm:text-base ${plan.featured ? 'bg-muted/20' : ''}`}>
                  {plan.features.find(f => f.includes('pins'))?.replace(' pins', '') || '-'}
                </td>
              ))}
            </tr>
            
            {/* Pinboards Row */}
            <tr className="border-b border-border/30">
              <td className="p-2 sm:p-4 font-medium text-sm sm:text-base">Pinboards</td>
              {plans.map((plan) => (
                <td key={plan.name} className={`text-center p-2 sm:p-4 text-sm sm:text-base ${plan.featured ? 'bg-muted/20' : ''}`}>
                  {plan.features.find(f => f.includes('pinboard'))?.replace(' pinboard', '').replace('s', '') || '-'}
                </td>
              ))}
            </tr>
            
                         {/* Updates Row */}
             <tr className="border-b border-border/30">
               <td className="p-2 sm:p-4 font-medium text-sm sm:text-base">Updates</td>
               {plans.map((plan) => (
                 <td key={plan.name} className={`text-center p-2 sm:p-4 text-sm sm:text-base ${plan.featured ? 'bg-muted/20' : ''}`}>
                   {plan.features.find(f => f.includes('update') || f.includes('Live') || f.includes('once')) || '-'}
                 </td>
               ))}
             </tr>
            
                         {/* API Access Row */}
             <tr className="border-b border-border/30">
               <td className="p-2 sm:p-4 font-medium text-sm sm:text-base">API Access</td>
               {plans.map((plan) => (
                 <td key={plan.name} className={`text-center p-2 sm:p-4 text-sm sm:text-base ${plan.featured ? 'bg-muted/20' : ''}`}>
                   {plan.features.find(f => f.includes('API')) || '-'}
                 </td>
               ))}
             </tr>
             
             {/* Document Intelligence Row */}
             <tr className="border-b border-border/30">
               <td className="p-2 sm:p-4 font-medium text-sm sm:text-base">Document Intelligence</td>
               {plans.map((plan) => (
                 <td key={plan.name} className={`text-center p-2 sm:p-4 text-sm sm:text-base ${plan.featured ? 'bg-muted/20' : ''}`}>
                   {plan.features.find(f => f.includes('document intelligence')) || '-'}
                 </td>
               ))}
             </tr>
             
             {/* Research Row */}
             <tr className="border-b border-border/30">
               <td className="p-2 sm:p-4 font-medium text-sm sm:text-base">Research</td>
               {plans.map((plan) => (
                 <td key={plan.name} className={`text-center p-2 sm:p-4 text-sm sm:text-base ${plan.featured ? 'bg-muted/20' : ''}`}>
                   {plan.features.find(f => f.includes('research')) || '-'}
                 </td>
               ))}
             </tr>
            
            {/* Additional Features Row */}
            <tr>
              <td className="p-2 sm:p-4 font-medium text-sm sm:text-base">Additional Features</td>
              {plans.map((plan) => (
                <td key={plan.name} className={`text-center p-2 sm:p-4 ${plan.featured ? 'bg-muted/20' : ''}`}>
                  <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                                         {plan.features
                       .filter(f => !f.includes('pins') && !f.includes('pinboard') && !f.includes('update') && !f.includes('API') && !f.includes('document intelligence') && !f.includes('research'))
                       .map((feature, index) => (
                        <div key={index} className="text-xs">{feature}</div>
                      ))}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
