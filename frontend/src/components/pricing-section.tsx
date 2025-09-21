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
      <h2 className="text-xl sm:text-2xl font-medium text-center mb-6 sm:mb-8">
        Pricing
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
               <th className="text-center p-2 sm:p-4 font-medium text-muted-foreground text-sm sm:text-base">Teams</th>
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
                  {plan.annualMonthlyPrice === "FREE" ? (
                    <div className="text-xs text-muted-foreground/70 mt-1">
                      forever
                    </div>
                  ) : isAnnual ? (
                    <div className="text-xs text-muted-foreground/70 mt-1">
                      paid annually
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground/70 mt-1">
                      paid monthly
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
