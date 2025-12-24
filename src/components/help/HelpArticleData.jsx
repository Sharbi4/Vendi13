export const HELP_ARTICLES = {
  'starting-ghost-kitchen': {
    slug: 'starting-ghost-kitchen',
    title: 'Starting a Ghost Kitchen: The Practical Launch Checklist',
    description: 'A step-by-step ghost kitchen launch guide—facility selection, equipment setup, food safety basics, and operating systems to go live fast and safely.',
    category: 'ghost-kitchen',
    seoTitle: 'Start a Ghost Kitchen: Licenses, Equipment, Operations Checklist',
    metaDescription: 'A step-by-step ghost kitchen launch guide—facility selection, equipment setup, food safety basics, and operating systems to go live fast and safely.',
    primaryKeyword: 'start a ghost kitchen',
    sections: [
      {
        heading: 'What a ghost kitchen is (plain English)',
        content: 'A ghost kitchen (also called a virtual kitchen) is a food operation designed primarily for delivery and takeout, often without a dine-in storefront.',
        citation: { source: 'NRA', url: 'https://restaurant.org/education-and-resources/resource-library/finding-the-ghost-kitchen-model-that%E2%80%99s-right-for-your-business/' }
      },
      {
        heading: 'Step-by-step launch checklist',
        content: `**Step 1 — Choose your operating model**
• Shared commissary, dedicated leased kitchen, or "kitchen inside an existing restaurant"
• Optimize for delivery radius, parking/loading, storage, and hours of access

**Step 2 — Confirm local compliance requirements**
• Most jurisdictions base requirements on a food code framework and local health department enforcement (permits, inspections, certified food protection manager, etc.)
• If you're mobile or tied to a commissary arrangement, requirements may route through the county where the commissary is located

**Step 3 — Build a "minimum viable menu" that travels well**
• Delivery-friendly packaging, stable holding characteristics, short station builds, limited SKUs

**Step 4 — Equip the kitchen correctly (don't improvise)**
• Prioritize equipment designed for food protection and sanitation (look for commercial-grade, cleanable designs)
• Consider energy-efficient commercial equipment to reduce operating cost

**Step 5 — Implement food safety SOPs on day one**
• Use "Clean, Separate, Cook, Chill" as the baseline; add a written temperature log for holding/cooling

**Step 6 — Build your production system**
• Prep list, par levels, station map, labels and dating, "first-in-first-out," daily sanitation close

**Step 7 — Go live with simple metrics**
• Ticket times, remake rate, food cost variance, customer complaints, refund rate, top items by margin`,
        citations: [
          { source: 'NRA', url: 'https://restaurant.org/education-and-resources/resource-library/finding-the-ghost-kitchen-model-that%E2%80%99s-right-for-your-business/' },
          { source: 'FDA', url: 'https://www.fda.gov/food/fda-food-code/food-code-2022' },
          { source: 'CDC', url: 'https://www.cdc.gov/food-safety/prevention/index.html' }
        ]
      }
    ],
    relatedArticles: ['commercial-equipment-basics', 'food-safety-temperatures', 'ventilation-fire-safety']
  },

  'commercial-equipment-basics': {
    slug: 'commercial-equipment-basics',
    title: 'Commercial Kitchen Equipment Basics: NSF, ETL/UL, and What to Look For',
    description: 'How to evaluate commercial kitchen equipment for sanitation, safety certifications, and operating cost—especially when buying used.',
    category: 'ghost-kitchen',
    seoTitle: 'Commercial Kitchen Equipment Basics: NSF, ETL/UL, Energy Star',
    metaDescription: 'How to evaluate commercial kitchen equipment for sanitation, safety certifications, and operating cost—especially when buying used.',
    primaryKeyword: 'commercial kitchen equipment basics',
    sections: [
      {
        heading: 'Buy equipment that is designed to be cleaned and inspected',
        content: 'Standards such as NSF/ANSI food equipment standards focus on sanitation-oriented materials and designs for food handling and processing equipment.',
        citation: { source: 'NSF', url: 'https://www.nsf.org/nsf-standards/standards-portfolio/food-equipment-standards' }
      },
      {
        heading: 'Verify safety certification marks where applicable',
        content: `• **ETL Listed** indicates product compliance to relevant safety standards (Intertek)
• **UL safety marks** are intended to help consumers identify certified products`,
        citations: [
          { source: 'Intertek', url: 'https://www.intertek.com/product-certification-marks/etl/faq/' },
          { source: 'UL', url: 'https://www.ul.com/look-ul-safety-mark-you-buy' }
        ]
      },
      {
        heading: 'Reduce operating cost with efficient equipment',
        content: 'ENERGY STAR-certified commercial food service equipment is designed to reduce energy use without sacrificing functionality.',
        citation: { source: 'ENERGY STAR', url: 'https://www.energystar.gov/products/commercial_food_service_equipment' }
      },
      {
        heading: 'Used equipment checklist (fast)',
        content: `• Model/serial photo, service history, visible corrosion, door seals, compressor noise, thermostat response
• Confirm electrical/gas requirements match your kitchen
• Confirm cleanability (no broken seams, exposed insulation, warped gaskets)
• If mobile use: confirm secure mounting, vibration tolerance, and ventilation`
      }
    ],
    relatedArticles: ['refrigeration-best-practices', 'preventive-maintenance']
  },

  'food-safety-temperatures': {
    slug: 'food-safety-temperatures',
    title: 'Food Safety Temperatures: Hold, Cook, and Cool',
    description: 'The most important food safety temperatures explained for operators—plus holding and cooling practices to reduce risk and stay compliant.',
    category: 'food-safety',
    seoTitle: 'Food Safety Temperatures: Cooking, Hot Holding, Cold Holding, Cooling',
    metaDescription: 'The most important food safety temperatures explained for operators—plus holding and cooling practices to reduce risk and stay compliant.',
    primaryKeyword: 'food safety temperatures',
    sections: [
      {
        heading: 'The baseline framework',
        content: 'Public health agencies emphasize four core steps: **Clean, Separate, Cook, Chill**.',
        citation: { source: 'CDC', url: 'https://www.cdc.gov/food-safety/prevention/index.html' }
      },
      {
        heading: 'Cooking temperatures (use a thermometer)',
        content: 'USDA FSIS publishes safe minimum internal temperature guidance for common foods.',
        citation: { source: 'USDA', url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart' }
      },
      {
        heading: 'Hot holding and cold holding (common code baseline)',
        content: 'Many state/operator guides reflect the standard baseline of **135°F+ hot holding** and **41°F or colder cold holding** for safety.',
        citation: { source: 'Oregon', url: 'https://www.oregon.gov/oda/Documents/Publications/FoodSafety/HotColdHoldTemperatures.pdf' }
      },
      {
        heading: 'Cooling cooked foods (high-impact risk area)',
        content: 'Improper cooling is a major contributor to foodborne illness; FDA provides Food Code-aligned cooling guidance for TCS foods.',
        citation: { source: 'FDA', url: 'https://www.fda.gov/media/181882/download' }
      }
    ],
    relatedArticles: ['refrigeration-best-practices']
  },

  'refrigeration-best-practices': {
    slug: 'refrigeration-best-practices',
    title: 'Refrigeration and Cold Holding: Keep Food Safe and Extend Equipment Life',
    description: 'How to run commercial refrigeration correctly—temperature control, airflow, cleaning, and maintenance to prevent spoilage and breakdowns.',
    category: 'maintenance',
    seoTitle: 'Refrigeration Best Practices: Cold Holding, Maintenance, Temperature Logs',
    metaDescription: 'How to run commercial refrigeration correctly—temperature control, airflow, cleaning, and maintenance to prevent spoilage and breakdowns.',
    primaryKeyword: 'commercial refrigeration best practices',
    sections: [
      {
        heading: 'Why commercial refrigeration is different',
        content: 'Commercial units are designed and tested for hot-kitchen environments and frequent door openings.',
        citation: { source: 'ENERGY STAR', url: 'https://www.energystar.gov/products/commercial_refrigerators_freezers' }
      },
      {
        heading: 'Operating rules that prevent most failures',
        content: `• Keep airflow clear (don't block vents with pans)
• Keep coils clean and gaskets intact
• Use a simple temperature log and corrective actions
• Store raw proteins below ready-to-eat foods (cross-contamination control)`,
        citation: { source: 'CDC', url: 'https://www.cdc.gov/food-safety/prevention/index.html' }
      },
      {
        heading: 'Energy and procurement considerations',
        content: 'Energy efficiency programs highlight that efficient units reduce energy use and operating costs.',
        citation: { source: 'ENERGY STAR', url: 'https://www.energystar.gov/products/commercial_food_service_equipment' }
      }
    ],
    relatedArticles: ['food-safety-temperatures']
  },

  'preventive-maintenance': {
    slug: 'preventive-maintenance',
    title: 'Preventive Maintenance for Food Trailers, Food Trucks, and Mobile Kitchens',
    description: 'A practical preventive maintenance schedule for mobile kitchens—reduce breakdowns, improve safety, and protect rental and resale value.',
    category: 'maintenance',
    seoTitle: 'Preventive Maintenance Checklist for Food Trailers and Food Trucks',
    metaDescription: 'A practical preventive maintenance schedule for mobile kitchens—reduce breakdowns, improve safety, and protect rental and resale value.',
    primaryKeyword: 'food trailer preventive maintenance',
    sections: [
      {
        heading: 'Why it matters',
        content: 'Industry groups emphasize that daily care and scheduled maintenance reduce downtime and long-term costs.',
        citation: { source: 'NAFEM', url: 'https://www.thenafemshow.org/equipment-maintenance-pays-off/' }
      },
      {
        heading: 'Weekly / monthly checklist (operator-grade)',
        content: `**Daily**
• Clean grease filters, wipe gaskets, check temps, inspect cords/hoses

**Weekly**
• Deep clean refrigeration, check propane connections visually, test GFCI outlets

**Monthly**
• Inspect exhaust components and document cleaning frequency (especially high-grease cooking)
• Check tires, lights, hitch, and safety chains (trailers)

**Quarterly**
• Professional service checks for hood suppression/ventilation where required`,
        citation: { source: 'NFPA', url: 'https://www.nfpa.org/codes-and-standards/nfpa-96-standard-development/96' }
      }
    ],
    relatedArticles: ['ventilation-fire-safety', 'generator-safety']
  },

  'ventilation-fire-safety': {
    slug: 'ventilation-fire-safety',
    title: 'Ventilation, Grease, and Fire Prevention: NFPA 96 Explained Simply',
    description: 'What NFPA 96 is trying to prevent, what operators should do daily, and how to reduce grease fire risk in commercial cooking.',
    category: 'fire-safety',
    seoTitle: 'NFPA 96 Basics: Hood Systems, Grease Control, Fire Prevention',
    metaDescription: 'What NFPA 96 is trying to prevent, what operators should do daily, and how to reduce grease fire risk in commercial cooking.',
    primaryKeyword: 'NFPA 96 basics',
    sections: [
      {
        heading: 'What NFPA 96 is',
        content: 'NFPA 96 provides preventive and operative fire safety requirements intended to reduce fire hazards in commercial cooking operations.',
        citation: { source: 'NFPA', url: 'https://www.nfpa.org/codes-and-standards/nfpa-96-standard-development/96' }
      },
      {
        heading: 'Practical operator rules',
        content: `• Run exhaust when cooking equipment is on
• Keep filters installed and clean
• Don't let grease accumulation become "normal"
• Maintain a documented cleaning cadence aligned to your cooking style and grease load`,
        citation: { source: 'NFPA', url: 'https://www.nfpa.org/codes-and-standards/nfpa-96-standard-development/96' }
      }
    ],
    relatedArticles: ['grease-trap-management']
  },

  'grease-trap-management': {
    slug: 'grease-trap-management',
    title: 'Grease Trap and FOG Management',
    description: 'How to manage fats, oils, and grease to protect plumbing, avoid backups, and stay compliant with local requirements.',
    category: 'fire-safety',
    seoTitle: 'Grease Trap Best Practices: FOG Control for Commercial Kitchens',
    metaDescription: 'How to manage fats, oils, and grease to protect plumbing, avoid backups, and stay compliant with local requirements.',
    primaryKeyword: 'grease trap best practices',
    sections: [
      {
        heading: 'Why cities care (and why you should too)',
        content: 'EPA materials describe how grease waste volumes can be significant and why control programs exist.',
        citation: { source: 'EPA', url: 'https://www.epa.gov/system/files/documents/2021-07/pretreatment_foodservice_fs.pdf' }
      },
      {
        heading: 'The 25% rule (common operational threshold)',
        content: 'Municipal best-practice manuals commonly state interceptors stop working effectively when FOG/solids reach roughly 25% of capacity and require cleaning/pump-out.',
        citation: { source: 'City of Phoenix', url: 'https://www.phoenix.gov/content/dam/phoenix/waterservicessite/documents/fog_bmp_manual_%204-2022.pdf' }
      },
      {
        heading: 'Practical rules',
        content: `• Never pour oil down drains
• Dry-wipe pans before washing
• Keep pump-out receipts and a maintenance log
• Train staff on "what goes in the sink" and "what never does"`
      }
    ],
    relatedArticles: ['ventilation-fire-safety']
  },

  'propane-safety': {
    slug: 'propane-safety',
    title: 'Propane and Gas Safety for Mobile Food Operations',
    description: 'Practical propane safety basics—how to prevent leaks, operate safely, and respond correctly to warning signs.',
    category: 'utilities',
    seoTitle: 'Propane Safety for Food Trailers and Food Trucks: Leaks, Storage, Response',
    metaDescription: 'Practical propane safety basics—how to prevent leaks, operate safely, and respond correctly to warning signs.',
    primaryKeyword: 'propane safety food truck',
    sections: [
      {
        heading: 'Safety baseline',
        content: 'Propane is safe when properly used, and training focuses on understanding systems and leak response.',
        citation: { source: 'Propane Education & Research Council', url: 'https://propane.com/safety/safety-articles/' }
      },
      {
        heading: 'Operator checklist',
        content: `• Know shutoff locations
• If you smell gas: shut off, ventilate, avoid ignition sources, and follow supplier guidance
• Secure cylinders upright and protect valves
• Inspect hoses and fittings routinely (replace damaged parts immediately)`
      }
    ],
    relatedArticles: ['generator-safety']
  },

  'generator-safety': {
    slug: 'generator-safety',
    title: 'Generator and Carbon Monoxide Safety (Mobile Kitchens)',
    description: 'How to run generators safely around people—key placement rules and CO prevention based on public health guidance.',
    category: 'utilities',
    seoTitle: 'Generator Safety for Food Trucks and Trailers: Prevent Carbon Monoxide Poisoning',
    metaDescription: 'How to run generators safely around people—key placement rules and CO prevention based on public health guidance.',
    primaryKeyword: 'generator safety food truck',
    sections: [
      {
        heading: 'CO risk is real and preventable',
        content: 'CDC warns that portable generators produce carbon monoxide (CO), an odorless, colorless gas that can kill without warning.',
        citation: { source: 'CDC', url: 'https://www.cdc.gov/carbon-monoxide/factsheets/generator-safety-fact-sheet.html' }
      },
      {
        heading: 'Practical rules that prevent tragedies',
        content: `• Run generators **outside** and away from doors, windows, vents
• Never run inside trailers, garages, or enclosed spaces
• Consider CO alarms in any enclosed working area adjacent to generator exhaust paths`,
        citation: { source: 'CDC', url: 'https://www.cdc.gov/carbon-monoxide/factsheets/generator-safety-fact-sheet.html' }
      }
    ],
    relatedArticles: ['propane-safety', 'preventive-maintenance']
  },

  // START HERE ARTICLES
  'how-vendibook-rentals-work': {
    slug: 'how-vendibook-rentals-work',
    title: 'How Vendibook Rentals Work (End-to-End)',
    description: 'The full rental lifecycle on Vendibook—how to choose a listing, confirm details, pick up, operate responsibly, and close out cleanly.',
    category: 'start',
    seoTitle: 'How Vendibook Rentals Work: Complete Rental Guide',
    metaDescription: 'The full rental lifecycle on Vendibook—how to choose a listing, confirm details, pick up, operate responsibly, and close out cleanly.',
    primaryKeyword: 'how vendibook rentals work',
    sections: [
      {
        heading: 'Renting on Vendibook',
        content: 'Renting on Vendibook is designed to be straightforward, but successful rentals come down to preparation and documentation.',
      },
      {
        heading: 'The rental process',
        content: `**Step 1 — Find the right listing**
• Filter by category (food truck, trailer, ghost kitchen, equipment)
• Confirm what's included: equipment list, power requirements, water setup, and any add-ons

**Step 2 — Verify dates, location, and responsibilities**
• Confirm your pickup window, return time, and what "clean return" means
• If travel/delivery is offered, confirm mileage pricing and limits

**Step 3 — Before pickup: do a 10-minute readiness check**
• Staff schedule, menu plan, packaging plan, ingredients staging
• If your operation involves food handling, plan for thermometer use and temperature logging

**Step 4 — Pickup and inspection**
• Take quick photos: exterior, hitch/tires (trailers), generator area, propane area, fridge temps, sinks, and any visible damage
• Confirm operating basics: breaker panel, propane shutoff, water pump, refrigeration controls

**Step 5 — During the rental**
• Operate safely, keep grease under control, keep surfaces clean, and log temps if you're holding food

**Step 6 — Return and closeout**
• Clean to the agreed standard, remove trash, wipe surfaces, empty gray water (if applicable)
• Take return photos and confirm handoff`,
        citation: { source: 'USDA FSIS', url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart' }
      }
    ],
    relatedArticles: ['inspection-checklist-before-you-rent', 'daily-open-close-checklist', 'generator-safety']
  },

  'how-buying-works-on-vendibook': {
    slug: 'how-buying-works-on-vendibook',
    title: 'How Buying Works on Vendibook (End-to-End)',
    description: 'A practical walkthrough of purchasing equipment, trailers, or trucks—from evaluation and verification to delivery or pickup.',
    category: 'start',
    seoTitle: 'How Buying Works on Vendibook: Complete Purchase Guide',
    metaDescription: 'A practical walkthrough of purchasing equipment, trailers, or trucks—from evaluation and verification to delivery or pickup.',
    primaryKeyword: 'buy mobile kitchen',
    sections: [
      {
        heading: 'The buying process',
        content: `Buying a used mobile kitchen or commercial equipment is a logistics project, not just a checkout.

**Step 1 — Evaluate fit**
• Will it support your menu and volume?
• Do utilities match your operating environment (power, propane, water)?

**Step 2 — Inspection and verification**
• Inspect structural condition, refrigeration performance, ventilation condition, and sanitation readiness
• If buying installed equipment, confirm recognized safety marks for electrical equipment when relevant (example: ETL Listed)

**Step 3 — Confirm transfer plan**
• Decide: local pickup, seller delivery, or freight
• If freight is used, confirm access for loading/unloading, liftgate needs, and delivery appointment expectations

**Step 4 — Document condition**
• Take photos and short videos at pickup or delivery
• Capture serial/model plates for key equipment, plus any included accessories

**Step 5 — Post-purchase commissioning**
• Clean thoroughly, test under load, and schedule any preventative maintenance before your first service day`,
        citation: { source: 'Intertek', url: 'https://www.intertek.com/product-certification-marks/etl/faq/' }
      }
    ],
    relatedArticles: ['inspection-checklist-before-you-buy-used-mobile-kitchen', 'commercial-equipment-basics', 'electrical-basics-shore-power-breakers-load-planning']
  },

  'inspection-checklist-before-you-rent': {
    slug: 'inspection-checklist-before-you-rent',
    title: 'What to Inspect Before You Rent a Trailer or Food Truck',
    description: 'A fast, practical inspection checklist renters can complete in 10–15 minutes to prevent downtime and disputes.',
    category: 'start',
    seoTitle: 'Rental Inspection Checklist for Food Trucks and Trailers',
    metaDescription: 'A fast, practical inspection checklist renters can complete in 10–15 minutes to prevent downtime and disputes.',
    primaryKeyword: 'food truck rental inspection',
    sections: [
      {
        heading: 'Your inspection goal',
        content: 'Your goal is simple: confirm the unit is operational, safe, and matches the listing.'
      },
      {
        heading: 'Complete inspection checklist',
        content: `**Exterior + basics**
• Tires inflated, lug nuts present, lights working (trailers)
• Doors latch, no obvious leaks, no exposed wiring

**Power**
• Shore power connection present (if applicable)
• Breaker panel accessible and labeled (even roughly)
• Test outlets/GFCI if available

**Propane**
• Cylinder secured upright, regulator intact, hoses not cracked
• Identify shutoff valve location

**Water**
• Fresh tank condition, pump turns on, hot water (if equipped)
• Sink drains flow, gray water handling understood

**Refrigeration**
• Verify unit is running, check thermometer reading
• Ask how long it takes to reach safe cold holding

**Ventilation + grease**
• Hood fan runs (if present), filters installed
• Surfaces reasonably clean and not grease-saturated

**Documentation**
• Photos: exterior, interior, equipment lineups, any pre-existing damage`
      }
    ],
    relatedArticles: ['daily-open-close-checklist', 'propane-safety', 'ventilation-fire-safety']
  },

  'inspection-checklist-before-you-buy-used-mobile-kitchen': {
    slug: 'inspection-checklist-before-you-buy-used-mobile-kitchen',
    title: 'What to Inspect Before You Buy a Used Food Truck or Trailer',
    description: 'A buyer\'s checklist for systems, equipment, documentation, and red flags—written for first-time buyers.',
    category: 'start',
    seoTitle: 'Used Food Truck Buying Inspection Checklist',
    metaDescription: 'A buyer\'s checklist for systems, equipment, documentation, and red flags—written for first-time buyers.',
    primaryKeyword: 'buy used food truck',
    sections: [
      {
        heading: 'Buyer\'s inspection guide',
        content: `Used units can be excellent value, but only if systems are verified.

**Structure + roadworthiness**
• Frame condition, floor integrity, door seals, visible rust
• Trailer hitch, safety chains, brake function (if equipped)

**Electrical**
• Confirm breaker panel condition and wiring cleanliness
• Test major appliances simultaneously to see if breakers trip

**Refrigeration**
• Confirm it can reach and maintain safe cold temps
• Inspect gaskets, condenser cleanliness, compressor cycling

**Propane**
• Check hose condition, regulator, and mounting
• Identify shutoffs and confirm safe routing

**Ventilation**
• Hood fan operation, filter condition, visible grease accumulation
• Heavy buildup implies maintenance gaps and potential hazard

**Sanitation**
• Sink setups, surfaces, cleanability, and overall facility condition

**Certification marks**
• For electrical appliances, check recognized third-party safety certification marks such as ETL Listed when applicable`,
        citation: { source: 'Intertek', url: 'https://www.intertek.com/product-certification-marks/etl/faq/' }
      }
    ],
    relatedArticles: ['commercial-equipment-basics', 'preventive-maintenance', 'electrical-basics-shore-power-breakers-load-planning']
  },

  'rent-vs-buy-mobile-kitchen-decision': {
    slug: 'rent-vs-buy-mobile-kitchen-decision',
    title: 'Rental vs. Purchase: How to Decide',
    description: 'A simple decision framework based on budget, timeline, and operational certainty.',
    category: 'start',
    seoTitle: 'Rent vs Buy Food Truck: Decision Guide',
    metaDescription: 'A simple decision framework based on budget, timeline, and operational certainty.',
    primaryKeyword: 'rent vs buy food truck',
    sections: [
      {
        heading: 'Decision framework',
        content: `**Rent if:**
• You're testing a concept, menu, or neighborhood
• You have seasonal demand
• You need flexibility across different event sizes
• You're building proof for financing or investors

**Buy if:**
• You can keep the unit in use consistently (weekly utilization)
• You already know your utility requirements and menu throughput
• You have a reliable maintenance plan and storage solution

**The practical math:**
• Estimate "days in use" per month
• Compare: monthly rent cost vs. monthly ownership cost (payment + insurance + maintenance + storage)
• If utilization is uncertain, renting preserves cash and reduces risk`
      }
    ],
    relatedArticles: ['how-vendibook-rentals-work', 'inspection-checklist-before-you-buy-used-mobile-kitchen']
  },

  'glossary-mobile-kitchen-terms': {
    slug: 'glossary-mobile-kitchen-terms',
    title: 'Glossary: Mobile Kitchen and Commercial Equipment Terms',
    description: 'Plain-English definitions of common food truck, trailer, and commercial kitchen terms you\'ll see in listings.',
    category: 'start',
    seoTitle: 'Mobile Kitchen Terms Glossary: Food Truck & Trailer Vocabulary',
    metaDescription: 'Plain-English definitions of common food truck, trailer, and commercial kitchen terms you\'ll see in listings.',
    primaryKeyword: 'mobile kitchen glossary',
    sections: [
      {
        heading: 'Essential terms explained',
        content: `**Shore power:** External power connection (often 30A/50A) supplying electricity without a generator

**Load planning:** Total electrical demand of equipment running at once

**GFCI outlet:** Safety outlet that trips when electrical fault is detected, common near sinks

**Grey water:** Wastewater collected from sinks

**Fresh water tank:** Onboard potable water storage

**Regulator (propane):** Device that controls propane pressure to appliances

**Hood system:** Ventilation system that removes heat, smoke, and grease-laden vapors

**FOG:** Fats, oils, grease—major cause of drain/sewer clogs

**TCS foods:** Time/Temperature Control for Safety foods requiring strict temperature control`,
        citations: [
          { source: 'TCEQ', url: 'https://www.tceq.texas.gov/' },
          { source: 'FDA', url: 'https://www.fda.gov/food/fda-food-code/food-code-2022' }
        ]
      }
    ],
    relatedArticles: []
  },

  // GHOST KITCHEN ARTICLES
  'ghost-kitchen-menu-design-what-delivers-well': {
    slug: 'ghost-kitchen-menu-design-what-delivers-well',
    title: 'Ghost Kitchen Menu Design: What Delivers Well',
    description: 'Build a delivery-first menu that preserves quality, reduces waste, and speeds throughput.',
    category: 'ghost-kitchen',
    seoTitle: 'Ghost Kitchen Menu Design: Build Delivery-First Menus',
    metaDescription: 'Build a delivery-first menu that preserves quality, reduces waste, and speeds throughput.',
    primaryKeyword: 'ghost kitchen menu design',
    sections: [
      {
        heading: 'Design for delivery',
        content: `Delivery changes your food.

**Design for hold time**
• Crisp items need vented packaging or separated components
• Sauces should travel in containers that don't leak and don't steam the product

**Reduce SKU count**
• Start with 8–12 core items
• Use "modular" ingredients that appear in multiple dishes

**Build a line, not a menu**
• Map each item to stations: cold prep, hot line, assembly, expo
• If one item requires a special station, it slows everything down

**Packaging rules**
• Separate hot/cold
• Use insulation for hot holding
• Label everything (name, allergens, reheat guidance)`
      }
    ],
    relatedArticles: ['packaging-for-delivery-hot-crisp-safe', 'kitchen-prep-systems-par-labels-fifo']
  },

  'kitchen-prep-systems-par-labels-fifo': {
    slug: 'kitchen-prep-systems-par-labels-fifo',
    title: 'Kitchen Prep Systems: Par Levels, Labels, FIFO',
    description: 'A simple prep system that prevents sell-outs, waste, and chaos.',
    category: 'ghost-kitchen',
    seoTitle: 'Kitchen Prep Systems: Par Levels and FIFO Guide',
    metaDescription: 'A simple prep system that prevents sell-outs, waste, and chaos.',
    primaryKeyword: 'kitchen prep systems',
    sections: [
      {
        heading: 'Building a prep system',
        content: `If you're improvising prep every day, you're paying for it in waste and stress.

**Par levels**
• Set a minimum ("par") for each ingredient based on daily volume
• Replenish back to par at close or before service

**Labels**
• Every container gets: item name, prep date, use-by date, initials
• Use consistent label placement so staff can spot it instantly

**FIFO**
• First In, First Out
• Place newer product behind older product
• Do a 60-second FIFO scan during open and mid-shift`
      }
    ],
    relatedArticles: ['daily-open-close-checklist', 'cooling-and-reheating-safe-methods']
  },

  'commercial-kitchen-layout-basics-workflow-safety': {
    slug: 'commercial-kitchen-layout-basics-workflow-safety',
    title: 'Commercial Kitchen Layout Basics (Workflow + Safety)',
    description: 'Layout principles that improve ticket times and reduce accidents.',
    category: 'ghost-kitchen',
    seoTitle: 'Commercial Kitchen Layout: Workflow & Safety Guide',
    metaDescription: 'Layout principles that improve ticket times and reduce accidents.',
    primaryKeyword: 'commercial kitchen layout',
    sections: [
      {
        heading: 'Layout principles',
        content: `A good layout reduces steps, reduces collisions, and reduces mistakes.

**Define zones**
• Receiving and storage
• Prep
• Cooking
• Assembly/Expo
• Dishwashing/clean-up

**Keep dirty and clean separated**
• Dirty dish flow should not cross prep/assembly flow

**Prevent slips and trips**
• Wet floors and clutter are major hazards; keep floors clean and dry, address spills immediately

**Optimize for peak**
• Layout for your busiest hour, not your slowest`,
        citation: { source: 'OSHA', url: 'https://www.osha.gov/etools/hospitals/food-services/slips-trips-falls' }
      }
    ],
    relatedArticles: []
  },

  'packaging-for-delivery-hot-crisp-safe': {
    slug: 'packaging-for-delivery-hot-crisp-safe',
    title: 'Packaging for Delivery: Keep Food Hot, Crisp, and Safe',
    description: 'Packaging tactics that protect quality, temperature, and customer trust.',
    category: 'ghost-kitchen',
    seoTitle: 'Food Delivery Packaging: Hot, Crisp, Safe',
    metaDescription: 'Packaging tactics that protect quality, temperature, and customer trust.',
    primaryKeyword: 'food delivery packaging',
    sections: [
      {
        heading: 'Packaging best practices',
        content: `Packaging is part of the customer experience.

**Hot foods**
• Use insulated bags for transport
• Keep vents for fried items to prevent steaming

**Cold foods**
• Keep separate from hot bags
• Include tamper-evident seals where possible

**Labeling**
• Item name, modifier notes, reheat notes, allergen flags

**Operational discipline**
• Standardize packaging per item so staff don't improvise under pressure`
      }
    ],
    relatedArticles: ['ghost-kitchen-menu-design-what-delivers-well']
  },

  'food-allergen-basics-for-small-operators': {
    slug: 'food-allergen-basics-for-small-operators',
    title: 'Food Allergen Basics for Small Operators',
    description: 'A practical approach to allergen risk—without turning your kitchen into a legal minefield.',
    category: 'ghost-kitchen',
    seoTitle: 'Food Allergen Safety for Small Kitchens',
    metaDescription: 'A practical approach to allergen risk—without turning your kitchen into a legal minefield.',
    primaryKeyword: 'food allergen safety',
    sections: [
      {
        heading: 'Managing allergen risk',
        content: `Allergen incidents are high-impact, even for small kitchens.

**Know the "major allergens" landscape**
• FDA provides guidance and updates related to major allergens and allergen labeling frameworks

**Create an allergen matrix**
• For each menu item list: contains, may contain (shared fryer), can be modified

**Operational controls**
• Separate utensils and pans when possible
• Change gloves and wipe surfaces between allergen and non-allergen builds

**Communication rule**
• Staff must never guess. If uncertain, escalate and verify ingredients`,
        citations: [
          { source: 'FDA Food Allergies', url: 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies' },
          { source: 'FDA Allergen Labeling', url: 'https://www.fda.gov/food/food-labeling-nutrition/food-allergen-labeling-and-consumer-protection-act-2004-questions-and-answers' }
        ]
      }
    ],
    relatedArticles: []
  },

  'cleaning-sanitizing-shared-kitchens-commissaries': {
    slug: 'cleaning-sanitizing-shared-kitchens-commissaries',
    title: 'Cleaning and Sanitizing in Shared Kitchens (Commissaries)',
    description: 'How to protect your brand when the kitchen is shared with other operators.',
    category: 'ghost-kitchen',
    seoTitle: 'Commissary Kitchen Cleaning Best Practices',
    metaDescription: 'How to protect your brand when the kitchen is shared with other operators.',
    primaryKeyword: 'commissary kitchen cleaning',
    sections: [
      {
        heading: 'Shared kitchen protocols',
        content: `Shared kitchens move fast, and standards vary.

**Before you start**
• Wipe and sanitize all contact surfaces
• Confirm dish station rules and chemical usage

**During service**
• Keep your containers labeled and consolidated
• Avoid spreading across multiple zones

**Close-down**
• Remove trash and food scraps
• Return equipment to agreed places
• Take a "close-out photo" of your cleaned zone for your records`
      }
    ],
    relatedArticles: []
  },

  'starting-a-ghost-kitchen-with-limited-equipment-mvp': {
    slug: 'starting-a-ghost-kitchen-with-limited-equipment-mvp',
    title: 'Starting a Ghost Kitchen With Limited Equipment (MVP Setup)',
    description: 'Launch quickly with the minimum equipment that still supports food safety and consistency.',
    category: 'ghost-kitchen',
    seoTitle: 'Start Ghost Kitchen with Minimal Equipment',
    metaDescription: 'Launch quickly with the minimum equipment that still supports food safety and consistency.',
    primaryKeyword: 'ghost kitchen mvp setup',
    sections: [
      {
        heading: 'MVP equipment approach',
        content: `Your MVP is not "cheap," it's focused.

**MVP equipment priorities**
• Refrigeration that holds safe temperatures
• Reliable hot cooking method (griddle, range, fryer, oven)
• Handwashing capability and cleanable prep surfaces

**MVP menu rules**
• Pick items that share ingredients and stations
• Avoid items that require specialized gear until volume justifies it

**Scale with intention**
• Add the equipment that removes your biggest bottleneck first`,
        citation: { source: 'USDA FSIS', url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart' }
      }
    ],
    relatedArticles: ['starting-ghost-kitchen', 'commercial-equipment-basics']
  },

  // MAINTENANCE ARTICLES
  'daily-open-close-checklist-mobile-kitchens': {
    slug: 'daily-open-close-checklist-mobile-kitchens',
    title: 'Daily Open/Close Checklist for Mobile Kitchens',
    description: 'A daily checklist that prevents breakdowns, unsafe service, and messy returns.',
    category: 'maintenance',
    seoTitle: 'Daily Checklist for Food Trucks and Trailers',
    metaDescription: 'A daily checklist that prevents breakdowns, unsafe service, and messy returns.',
    primaryKeyword: 'food truck daily checklist',
    sections: [
      {
        heading: 'Daily routine',
        content: `**Open checklist**
• Verify power source, cords, and breakers
• Check refrigeration temps before loading product
• Confirm water pump, sinks, and soap/sanitizer readiness
• Confirm propane shutoff location and smell-check area
• Wipe contact surfaces and set up clean tools

**Close checklist**
• Cool and store foods safely (don't leave product in danger zone)
• Remove trash and food waste
• Wipe, degrease, and dry surfaces
• Clean hood filters if grease load is heavy
• Shut down propane, secure cylinders, and power down safely
• Lock doors, secure hitch, confirm keys/lockbox return process`,
        citation: { source: 'USDA FSIS', url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart' }
      }
    ],
    relatedArticles: ['preventive-maintenance', 'inspection-checklist-before-you-rent']
  },

  'deep-cleaning-schedule-weekly-monthly-quarterly': {
    slug: 'deep-cleaning-schedule-weekly-monthly-quarterly',
    title: 'Deep Cleaning Schedule: Weekly, Monthly, Quarterly',
    description: 'A realistic deep cleaning cadence for mobile kitchens and commercial equipment.',
    category: 'maintenance',
    seoTitle: 'Deep Cleaning Schedule for Food Trucks',
    metaDescription: 'A realistic deep cleaning cadence for mobile kitchens and commercial equipment.',
    primaryKeyword: 'food truck cleaning schedule',
    sections: [
      {
        heading: 'Cleaning cadence',
        content: `**Weekly**
• Degrease cookline surfaces
• Clean refrigerator gaskets and door tracks
• Sanitize storage bins and handles

**Monthly**
• Clean condenser coils (if accessible)
• Inspect cords, hoses, and fittings
• Deep clean floors and corners

**Quarterly**
• Full ventilation inspection and deeper cleaning aligned to grease load and cooking style
• Service critical systems before peak season`,
        citation: { source: 'NFPA', url: 'https://www.nfpa.org/codes-and-standards/nfpa-96-standard-development/96' }
      }
    ],
    relatedArticles: ['preventive-maintenance', 'hood-filter-cleaning-frequency-best-practices']
  },

  'refrigeration-troubleshooting-wont-hold-temp': {
    slug: 'refrigeration-troubleshooting-wont-hold-temp',
    title: 'Refrigeration Troubleshooting: Why It Won\'t Hold Temp',
    description: 'Common causes of refrigeration failures and how to stabilize quickly.',
    category: 'maintenance',
    seoTitle: 'Fix Refrigeration Temperature Problems',
    metaDescription: 'Common causes of refrigeration failures and how to stabilize quickly.',
    primaryKeyword: 'refrigeration troubleshooting',
    sections: [
      {
        heading: 'Quick troubleshooting',
        content: `**Fast checks**
• Is the unit overpacked (blocking vents)?
• Are doors sealing (gaskets intact)?
• Is the condenser clogged with dust/grease?

**Operational fixes**
• Reduce load, move product to a backup cooler if needed
• Keep doors closed, avoid constant opening
• Clean visible intake areas carefully

**If temps remain unsafe**
• Stop service for that product category and move to a safe alternative plan`,
        citation: { source: 'Minnesota DOH', url: 'https://www.health.state.mn.us/communities/environment/food/docs/fs/hotcoldhold.pdf' }
      }
    ],
    relatedArticles: ['refrigeration-best-practices', 'food-safety-temperatures']
  },

  'water-system-basics-fresh-gray-winterizing': {
    slug: 'water-system-basics-fresh-gray-winterizing',
    title: 'Water System Basics: Fresh Water, Gray Water, Winterizing',
    description: 'How onboard water systems work, what fails, and how to prevent freeze damage.',
    category: 'maintenance',
    seoTitle: 'Mobile Kitchen Water Systems Guide',
    metaDescription: 'How onboard water systems work, what fails, and how to prevent freeze damage.',
    primaryKeyword: 'mobile kitchen water system',
    sections: [
      {
        heading: 'Water system management',
        content: `**Fresh water**
• Use potable-safe hoses and clean fill caps
• Avoid introducing contaminants during fill

**Gray water**
• Empty on schedule, not only "when full"
• Keep the drain hose and fittings clean and sealed

**Winterizing**
• Drain tanks and lines as required
• Protect pumps and fittings from freezing`
      }
    ],
    relatedArticles: []
  },

  'electrical-basics-shore-power-breakers-load-planning': {
    slug: 'electrical-basics-shore-power-breakers-load-planning',
    title: 'Electrical System Basics: Shore Power, Breakers, Load Planning',
    description: 'Prevent blown breakers and unsafe setups by understanding basic electrical load planning.',
    category: 'maintenance',
    seoTitle: 'Food Truck Electrical Basics: Shore Power & Load Planning',
    metaDescription: 'Prevent blown breakers and unsafe setups by understanding basic electrical load planning.',
    primaryKeyword: 'food truck electrical basics',
    sections: [
      {
        heading: 'Electrical fundamentals',
        content: `**Shore power**
• Confirm amperage availability (example: 30A vs 50A) before setup
• Use the correct adapter and cord rating

**Load planning**
• Identify high-draw equipment: AC, refrigerators, fryers, griddles, hot water heaters
• Stagger startup (don't start everything simultaneously)

**Breaker discipline**
• If breakers trip repeatedly, reduce load and troubleshoot before continuing`
      }
    ],
    relatedArticles: ['generator-sizing-guide-food-trucks-trailers']
  },

  'prevent-mold-odors-moisture-damage-trailers': {
    slug: 'prevent-mold-odors-moisture-damage-trailers',
    title: 'Preventing Mold, Odors, and Moisture Damage in Trailers',
    description: 'Keep your unit fresh, clean, and resale-ready by controlling moisture.',
    category: 'maintenance',
    seoTitle: 'Prevent Mold in Food Trailers',
    metaDescription: 'Keep your unit fresh, clean, and resale-ready by controlling moisture.',
    primaryKeyword: 'prevent mold food trailer',
    sections: [
      {
        heading: 'Moisture control',
        content: `• Dry floors and corners at close
• Keep door seals clean so they seal properly
• Don't store wet rags, mops, or cardboard
• Check roof seams and window edges periodically
• Use moisture absorbers in long storage periods`
      }
    ],
    relatedArticles: ['off-season-shutdown-checklist-mobile-kitchens']
  },

  'off-season-shutdown-checklist-mobile-kitchens': {
    slug: 'off-season-shutdown-checklist-mobile-kitchens',
    title: 'Storage and Off-Season Shutdown Checklist',
    description: 'A shutdown checklist that prevents corrosion, pests, and system damage.',
    category: 'maintenance',
    seoTitle: 'Off-Season Food Truck Storage Checklist',
    metaDescription: 'A shutdown checklist that prevents corrosion, pests, and system damage.',
    primaryKeyword: 'food truck winter storage',
    sections: [
      {
        heading: 'Shutdown procedure',
        content: `• Deep clean, degrease, and dry
• Remove all food and packaging that attracts pests
• Drain gray water, and winterize if needed
• Shut off propane, secure cylinders
• Unplug and store cords properly
• Cover safely while allowing minimal ventilation to avoid trapped moisture`
      }
    ],
    relatedArticles: ['prevent-mold-odors-moisture-damage-trailers', 'water-system-basics-fresh-gray-winterizing']
  },

  // FOOD SAFETY ARTICLES
  'cooling-and-reheating-safe-methods': {
    slug: 'cooling-and-reheating-safe-methods',
    title: 'Cooling and Reheating: Safe Methods That Prevent Illness',
    description: 'Cooling is where many operators get cited. Here\'s a practical method that works in real kitchens.',
    category: 'food-safety',
    seoTitle: 'Safe Food Cooling and Reheating Methods',
    metaDescription: 'Cooling is where many operators get cited. Here\'s a practical method that works in real kitchens.',
    primaryKeyword: 'safe food cooling',
    sections: [
      {
        heading: 'Proper cooling and reheating',
        content: `Cooling isn't "put it in the fridge and hope."

**Cooling**
• Use shallow pans, uncovered or loosely covered until steam stops
• Don't stack hot pans; airflow matters
• FDA cooling guidance commonly reflects: cool from 135°F to 70°F within 2 hours, then to 41°F within the next 4 hours

**Reheating**
• Reheat quickly, not slowly
• Verify internal temperature using a thermometer`,
        citation: { source: 'FDA', url: 'https://www.fda.gov/media/181882/download' }
      }
    ],
    relatedArticles: ['food-safety-temperatures', 'thermometer-use-calibration-logging-sop']
  },

  'hot-holding-and-transport-catering-events': {
    slug: 'hot-holding-and-transport-catering-events',
    title: 'Hot Holding and Transport: Catering and Events',
    description: 'Keep food safe and high-quality during transport and event service.',
    category: 'food-safety',
    seoTitle: 'Hot Holding and Transport Safety for Catering',
    metaDescription: 'Keep food safe and high-quality during transport and event service.',
    primaryKeyword: 'hot holding food safety',
    sections: [
      {
        heading: 'Safe hot holding practices',
        content: `**Hot holding baseline**
• Many health department guides reflect hot holding at 135°F or higher for TCS foods

**Transport rules**
• Preheat hot boxes/insulated carriers
• Keep containers closed during transit
• Check temps at arrival, then periodically during service`,
        citation: { source: 'Minnesota DOH', url: 'https://www.health.state.mn.us/communities/environment/food/docs/fs/hotcoldhold.pdf' }
      }
    ],
    relatedArticles: ['food-safety-temperatures', 'packaging-for-delivery-hot-crisp-safe']
  },

  'cross-contamination-prevention-small-teams': {
    slug: 'cross-contamination-prevention-small-teams',
    title: 'Cross-Contamination Prevention for Small Teams',
    description: 'Small teams need simple rules that actually get followed under pressure.',
    category: 'food-safety',
    seoTitle: 'Prevent Cross-Contamination in Commercial Kitchens',
    metaDescription: 'Small teams need simple rules that actually get followed under pressure.',
    primaryKeyword: 'prevent cross contamination',
    sections: [
      {
        heading: 'Cross-contamination controls',
        content: `• Separate raw proteins from ready-to-eat foods
• Use dedicated cutting boards/tools if possible
• Change gloves and wash hands between tasks
• Store raw below ready-to-eat in refrigeration`,
        citation: { source: 'USDA FSIS', url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart' }
      }
    ],
    relatedArticles: ['food-safety-temperatures']
  },

  'thermometer-use-calibration-logging-sop': {
    slug: 'thermometer-use-calibration-logging-sop',
    title: 'Thermometer Use: Calibration, Logging, and SOP',
    description: 'Thermometers are inexpensive. Not using them is expensive.',
    category: 'food-safety',
    seoTitle: 'Food Thermometer Use and Calibration Guide',
    metaDescription: 'Thermometers are inexpensive. Not using them is expensive.',
    primaryKeyword: 'food thermometer use',
    sections: [
      {
        heading: 'Proper thermometer use',
        content: `**How to use**
• Insert into thickest portion of food, avoid bone and pan contact
• Sanitize between uses

**When to log**
• Cooking verification
• Hot holding checks
• Cooling checkpoints`,
        citation: { source: 'USDA FSIS', url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart' }
      }
    ],
    relatedArticles: ['food-safety-temperatures', 'cooling-and-reheating-safe-methods']
  },

  // FIRE SAFETY ARTICLES
  'hood-filter-cleaning-frequency-best-practices': {
    slug: 'hood-filter-cleaning-frequency-best-practices',
    title: 'Hood Filter Cleaning: Frequency and Best Practices',
    description: 'Filter cleaning is the simplest way to reduce grease fire risk.',
    category: 'fire-safety',
    seoTitle: 'Hood Filter Cleaning Best Practices',
    metaDescription: 'Filter cleaning is the simplest way to reduce grease fire risk.',
    primaryKeyword: 'hood filter cleaning',
    sections: [
      {
        heading: 'Filter maintenance',
        content: `• Run ventilation whenever cooking equipment is on
• Keep filters installed correctly
• Clean filters on a schedule aligned to cooking intensity
• Keep a simple log (date, person, notes)`,
        citation: { source: 'NFPA', url: 'https://www.nfpa.org/codes-and-standards/nfpa-96-standard-development/96' }
      }
    ],
    relatedArticles: ['ventilation-fire-safety', 'grease-trap-management']
  },

  'grease-fire-response-what-to-do-not-do': {
    slug: 'grease-fire-response-what-to-do-not-do',
    title: 'Grease Fire Response: What To Do (and Not Do)',
    description: 'A calm, correct response prevents injuries and catastrophic loss.',
    category: 'fire-safety',
    seoTitle: 'Grease Fire Response Guide',
    metaDescription: 'A calm, correct response prevents injuries and catastrophic loss.',
    primaryKeyword: 'grease fire response',
    sections: [
      {
        heading: 'Emergency response',
        content: `• If safe: turn off heat source
• If safe: shut off gas/propane supply
• Smother small pan fires with a lid (if trained and safe)
• Use a Class K extinguisher for cooking oil fires if available
• Evacuate and call emergency services when risk escalates`,
        citation: { source: 'NFPA', url: 'https://www.nfpa.org/codes-and-standards/nfpa-96-standard-development/96' }
      }
    ],
    relatedArticles: ['fire-extinguisher-basics-food-operations', 'ventilation-fire-safety']
  },

  'fire-extinguisher-basics-food-operations': {
    slug: 'fire-extinguisher-basics-food-operations',
    title: 'Fire Extinguisher Basics for Food Operations',
    description: 'Extinguishers are only useful when they\'re correct, accessible, and staff know basics.',
    category: 'fire-safety',
    seoTitle: 'Fire Extinguisher Basics for Commercial Kitchens',
    metaDescription: 'Extinguishers are only useful when they\'re correct, accessible, and staff know basics.',
    primaryKeyword: 'fire extinguisher kitchen',
    sections: [
      {
        heading: 'Extinguisher fundamentals',
        content: `• Keep extinguishers visible and unblocked
• Train staff on:
  - Pull pin
  - Aim
  - Squeeze
  - Sweep
• Inspect monthly (pressure gauge, pin, hose, accessibility)
• Replace or service as required`
      }
    ],
    relatedArticles: ['grease-fire-response-what-to-do-not-do']
  },

  // UTILITIES ARTICLES
  'generator-sizing-guide-food-trucks-trailers': {
    slug: 'generator-sizing-guide-food-trucks-trailers',
    title: 'Generator Sizing Guide for Food Trucks and Trailers',
    description: 'Avoid underpowered setups and nuisance shutdowns with basic sizing logic.',
    category: 'utilities',
    seoTitle: 'Generator Sizing for Food Trucks',
    metaDescription: 'Avoid underpowered setups and nuisance shutdowns with basic sizing logic.',
    primaryKeyword: 'generator sizing food truck',
    sections: [
      {
        heading: 'Proper generator sizing',
        content: `• List equipment and wattage (or amps)
• Identify surge loads (compressors, AC)
• Add 20–30% headroom for stability
• Use properly rated cords and avoid overloading

**Safety note:**
Generator exhaust contains carbon monoxide; operate only outdoors and away from openings`,
        citations: [
          { source: 'CDC', url: 'https://www.cdc.gov/carbon-monoxide/factsheets/generator-safety-fact-sheet.html' },
          { source: 'CPSC', url: 'https://www.cpsc.gov/Safety-Education/Safety-Education-Centers/Portable-Generators' }
        ]
      }
    ],
    relatedArticles: ['generator-safety', 'electrical-basics-shore-power-breakers-load-planning']
  },

  'propane-system-checklist-tanks-regulators-hoses-leaks': {
    slug: 'propane-system-checklist-tanks-regulators-hoses-leaks',
    title: 'Propane System Checklist: Tanks, Regulators, Hoses, Leaks',
    description: 'A quick safety checklist you can run before every service day.',
    category: 'utilities',
    seoTitle: 'Propane System Safety Checklist',
    metaDescription: 'A quick safety checklist you can run before every service day.',
    primaryKeyword: 'propane system safety',
    sections: [
      {
        heading: 'Daily propane checks',
        content: `• Confirm cylinders are upright and secured
• Inspect regulator condition and mounting
• Inspect hoses for cracking, abrasion, and loose fittings
• Identify and test shutoff operation (when trained)
• If you smell gas: shut off if safe, ventilate, avoid ignition sources, and escalate to professionals`
      }
    ],
    relatedArticles: ['propane-safety', 'generator-safety']
  },

  'power-planning-noise-neighbors-event-rules': {
    slug: 'power-planning-noise-neighbors-event-rules',
    title: 'Noise, Neighbors, and Event Rules: Power Planning at Venues',
    description: 'Venue rules can break your service day. Plan power and noise early.',
    category: 'utilities',
    seoTitle: 'Event Venue Power Planning for Food Trucks',
    metaDescription: 'Venue rules can break your service day. Plan power and noise early.',
    primaryKeyword: 'event venue power planning',
    sections: [
      {
        heading: 'Venue power planning',
        content: `**Ask the organizer:**
• Is shore power available?
• Amperage and outlet type?
• Quiet hours and generator restrictions?

**Placement basics:**
• Put generator downwind and away from doors/windows/vents
• Use barriers to reduce noise (without restricting airflow)`,
        citation: { source: 'CDC', url: 'https://www.cdc.gov/carbon-monoxide/factsheets/generator-safety-fact-sheet.html' }
      }
    ],
    relatedArticles: ['generator-safety', 'generator-sizing-guide-food-trucks-trailers']
  }
};