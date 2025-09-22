"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
        "20 pins",
        "1 pinboard",
        "Live updates",
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
          "100 pins",
          "10 pinboards",
          "Live updates",
          "Full API access",
          "AI document intelligence",
          "AI research"
        ],
      featured: true
    },
    {
      name: "Teams",
      description: "For teams and organizations",
       monthlyPrice: "$79/mo", 
       annualMonthlyPrice: "$50/mo",
                        features: [
           "250 pins",
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
           "500+ pins",
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
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-6">
          <span>$</span>
          <span>Pricing</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent leading-tight">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Choose the plan that fits your team's needs. No hidden fees, no surprises.
        </p>
      </div>
      
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
            <span className="ml-1 text-xs text-muted-foreground font-semibold hidden sm:inline">Save up to 37%</span>
          </button>
        </div>
      </div>

      {/* Mobile Tabs Layout */}
      <div className="block lg:hidden">
        <Tabs defaultValue="professional" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="starter" className="text-xs">Starter</TabsTrigger>
            <TabsTrigger value="hobby" className="text-xs">Hobby</TabsTrigger>
            <TabsTrigger value="professional" className="text-xs">Pro</TabsTrigger>
            <TabsTrigger value="startups" className="text-xs">Teams</TabsTrigger>
            <TabsTrigger value="social" className="text-xs">Social</TabsTrigger>
          </TabsList>
          
          {plans.map((plan) => {
            const tabValue = plan.name.toLowerCase().replace(' ', '').replace('media', '');
            return (
            <TabsContent key={plan.name} value={tabValue} className="mt-0">
              <div className={`border border-border/50 rounded-lg p-6 ${plan.featured ? 'bg-muted/20 border-primary/20' : 'bg-background'}`}>
                {plan.featured && (
                  <div className="flex justify-center mb-4">
                    <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                      Recommended
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                  <div className="text-3xl font-mono font-bold mb-1">
                    {isAnnual ? plan.annualMonthlyPrice : plan.monthlyPrice}
                  </div>
                  {plan.annualMonthlyPrice === "FREE" ? (
                    <div className="text-sm text-muted-foreground">
                      forever
                    </div>
                  ) : isAnnual ? (
                    <div className="text-sm text-muted-foreground">
                      paid annually
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      paid monthly
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-border/20">
                    <span className="font-medium">Pins:</span>
                    <span className="font-mono">{plan.features.find(f => f.includes('pins'))?.replace(' pins', '') || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/20">
                    <span className="font-medium">Pinboards:</span>
                    <span className="font-mono">{plan.features.find(f => f.includes('pinboard'))?.replace(' pinboard', '').replace('s', '') || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/20">
                    <span className="font-medium">Updates:</span>
                    <span>{plan.features.find(f => f.includes('update') || f.includes('Live') || f.includes('once')) || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/20">
                    <span className="font-medium">API Access:</span>
                    <span>{plan.features.find(f => f.includes('API')) || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/20">
                    <span className="font-medium">Document Intelligence:</span>
                    <span>{plan.features.find(f => f.includes('document intelligence')) || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/20">
                    <span className="font-medium">Research:</span>
                    <span>{plan.features.find(f => f.includes('research')) || '-'}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-border/30">
                    <div className="font-medium mb-3">Additional Features:</div>
                    <div className="space-y-2">
                      {plan.features
                        .filter(f => !f.includes('pins') && !f.includes('pinboard') && !f.includes('update') && !f.includes('API') && !f.includes('document intelligence') && !f.includes('research'))
                        .map((feature, index) => (
                          <div key={index} className="text-muted-foreground flex items-center">
                            <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2"></span>
                            {feature}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden lg:block overflow-x-auto pt-8">
        <div className="relative">
          {/* Recommended Badge - Positioned above container, centered over Professional column */}
          <div className="absolute -top-3 z-10" style={{left: 'calc(50% + 10px)'}}>
            <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium shadow-sm transform -translate-x-1/2">
              Recommended
            </span>
          </div>
          
          <div className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-background/90 dark:to-muted/20 rounded-2xl border border-border/50 shadow-lg backdrop-blur-sm overflow-hidden">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-border/50 bg-muted/5">
                  <th className="text-left p-4 font-semibold text-foreground">Plan</th>
                  <th className="text-center p-4 font-semibold text-foreground">Starter</th>
                  <th className="text-center p-4 font-semibold text-foreground">Hobby</th>
                  <th className="text-center p-4 font-semibold text-foreground bg-primary/5 relative">
                    Professional
                  </th>
                  <th className="text-center p-4 font-semibold text-foreground">Teams</th>
                  <th className="text-center p-4 font-semibold text-foreground">Social Media</th>
                </tr>
              </thead>
            <tbody>
              {/* Price Row */}
              <tr className="border-b border-border/30">
                <td className="p-4 font-semibold text-foreground">Price</td>
                {plans.map((plan) => (
                  <td key={plan.name} className={`text-center p-4 ${plan.featured ? 'bg-primary/5' : ''}`}>
                    <div className="text-xl font-bold text-primary mb-1">
                      {isAnnual ? plan.annualMonthlyPrice : plan.monthlyPrice}
                    </div>
                    {plan.annualMonthlyPrice === "FREE" ? (
                      <div className="text-xs text-muted-foreground">
                        forever
                      </div>
                    ) : isAnnual ? (
                      <div className="text-xs text-muted-foreground">
                        paid annually
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        paid monthly
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            
              {/* Pins Row */}
              <tr className="border-b border-border/30">
                <td className="p-4 font-semibold text-foreground">Pins</td>
                {plans.map((plan) => (
                  <td key={plan.name} className={`text-center p-4 ${plan.featured ? 'bg-primary/5' : ''}`}>
                    <span className="font-medium">
                      {plan.features.find(f => f.includes('pins'))?.replace(' pins', '') || '-'}
                    </span>
                  </td>
                ))}
              </tr>
              
              {/* Pinboards Row */}
              <tr className="border-b border-border/30">
                <td className="p-4 font-semibold text-foreground">Pinboards</td>
                {plans.map((plan) => (
                  <td key={plan.name} className={`text-center p-4 ${plan.featured ? 'bg-primary/5' : ''}`}>
                    <span className="font-medium">
                      {plan.features.find(f => f.includes('pinboard'))?.replace(' pinboard', '').replace('s', '') || '-'}
                    </span>
                  </td>
                ))}
              </tr>
              
              {/* Updates Row */}
              <tr className="border-b border-border/30">
                <td className="p-4 font-semibold text-foreground">Updates</td>
                {plans.map((plan) => (
                  <td key={plan.name} className={`text-center p-4 ${plan.featured ? 'bg-primary/5' : ''}`}>
                    <span className="font-medium">
                      {plan.features.find(f => f.includes('update') || f.includes('Live') || f.includes('once')) || '-'}
                    </span>
                  </td>
                ))}
              </tr>
              
              {/* API Access Row */}
              <tr className="border-b border-border/30">
                <td className="p-4 font-semibold text-foreground">API Access</td>
                {plans.map((plan) => (
                  <td key={plan.name} className={`text-center p-4 ${plan.featured ? 'bg-primary/5' : ''}`}>
                    <span className="font-medium">
                      {plan.features.find(f => f.includes('API')) || '-'}
                    </span>
                  </td>
                ))}
              </tr>
              
              {/* Document Intelligence Row */}
              <tr className="border-b border-border/30">
                <td className="p-4 font-semibold text-foreground">Document Intelligence</td>
                {plans.map((plan) => (
                  <td key={plan.name} className={`text-center p-4 ${plan.featured ? 'bg-primary/5' : ''}`}>
                    <span className="font-medium">
                      {plan.features.find(f => f.includes('document intelligence')) || '-'}
                    </span>
                  </td>
                ))}
              </tr>
              
              {/* Research Row */}
              <tr className="border-b border-border/30">
                <td className="p-4 font-semibold text-foreground">Research</td>
                {plans.map((plan) => (
                  <td key={plan.name} className={`text-center p-4 ${plan.featured ? 'bg-primary/5' : ''}`}>
                    <span className="font-medium">
                      {plan.features.find(f => f.includes('research')) || '-'}
                    </span>
                  </td>
                ))}
              </tr>
            
              {/* Additional Features Row */}
              <tr>
                <td className="p-4 font-semibold text-foreground">Additional Features</td>
                {plans.map((plan) => (
                  <td key={plan.name} className={`text-center p-4 ${plan.featured ? 'bg-primary/5' : ''}`}>
                    <div className="text-sm text-muted-foreground space-y-2">
                      {plan.features
                        .filter(f => !f.includes('pins') && !f.includes('pinboard') && !f.includes('update') && !f.includes('API') && !f.includes('document intelligence') && !f.includes('research'))
                        .map((feature, index) => (
                          <div key={index} className="text-sm">{feature}</div>
                        ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  )
}
