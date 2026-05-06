export interface SpreadMetadata {
  code: string;
  title: string;
  observations?: string;
  observationDate?: string;
  updated?: string;
  nextRelease?: string;
  units: string;
  frequency: string;
  dateRange?: string;
  source: string;
  sourceLink?: string;
  releaseTitle?: string;
  releaseLink?: string;
  fredLink?: string;
  notes?: string;
  suggestedCitation?: string;
}

export const spreadMetadata: Record<string, SpreadMetadata> = {
  BAMLC0A4CBBB: {
    code: 'BAMLC0A4CBBB',
    title: 'ICE BofA BBB US Corporate Index Option-Adjusted Spread',
    observations: '1.02',
    observationDate: '2026-04-28',
    updated: 'Apr 29, 2026 9:13 AM CDT',
    nextRelease: 'Apr 30, 2026',
    units: 'Percent, Not Seasonally Adjusted',
    frequency: 'Daily, Close',
    source: 'Ice Data Indices, LLC',
    sourceLink: 'https://www.ice.com/fixed-income-data-services/index-solutions',
    releaseTitle: 'ICE BofA Indices',
    releaseLink: 'https://www.ice.com/fixed-income-data-services/index-solutions',
    fredLink: 'https://fred.stlouisfed.org/series/BAMLC0A4CBBB',
    notes: `Starting in April 2026, this series will only include 3 years of observations. For more data, go to the source.

This data represents the Option-Adjusted Spread (OAS) of the ICE BofA BBB US Corporate Index, a subset of the ICE BofA US Corporate Master Index tracking the performance of US dollar denominated investment grade rated corporate debt publicly issued in the US domestic market. This subset includes all securities with a given investment grade rating BBB.
The ICE BofA OASs are the calculated spreads between a computed OAS index of all bonds in a given rating category and a spot Treasury curve. An OAS index is constructed using each constituent bond's OAS, weighted by market capitalization. When the last calendar day of the month takes place on the weekend, weekend observations will occur as a result of month ending accrued interest adjustments.

Certain indices and index data included in FRED are the property of ICE Data Indices, LLC (“ICE DATA”) and used under license. ICE® IS A REGISTERED TRADEMARK OF ICE DATA OR ITS AFFILIATES AND BOFA® IS A REGISTERED TRADEMARK OF BANK OF AMERICA CORPORATION LICENSED BY BANK OF AMERICA CORPORATION AND ITS AFFILIATES (“BOFA”) AND MAY NOT BE USED WITHOUT BOFA’S PRIOR WRITTEN APPROVAL. ICE DATA, ITS AFFILIATES AND THEIR RESPECTIVE THIRD PARTY SUPPLIERS DISCLAIM ANY AND ALL WARRANTIES AND REPRESENTATIONS, EXPRESS AND/OR IMPLIED, INCLUDING ANY WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE OR USE, INCLUDING WITH REGARD TO THE INDICES, INDEX DATA AND ANY DATA INCLUDED IN, RELATED TO, OR DERIVED THEREFROM. NEITHER ICE DATA, NOR ITS AFFILIATES OR THEIR RESPECTIVE THIRD PARTY PROVIDERS SHALL BE SUBJECT TO ANY DAMAGES OR LIABILITY WITH RESPECT TO THE ADEQUACY, ACCURACY, TIMELINESS OR COMPLETENESS OF THE INDICES OR THE INDEX DATA OR ANY COMPONENT THEREOF. THE INDICES AND INDEX DATA AND ALL COMPONENTS THEREOF ARE PROVIDED ON AN “AS IS” BASIS AND YOUR USE IS AT YOUR OWN RISK. ICE DATA, ITS AFFILIATES AND THEIR RESPECTIVE THIRD PARTY SUPPLIERS DO NOT SPONSOR, ENDORSE, OR RECOMMEND FRED, OR ANY OF ITS PRODUCTS OR SERVICES.

Copyright, 2023, ICE Data Indices. Reproduction of this data in any form is prohibited except with the prior written permission of ICE Data Indices.

The end of day Index values, Index returns, and Index statistics (“Top Level Data”) are being provided for your internal use only and you are not authorized or permitted to publish, distribute or otherwise furnish Top Level Data to any third-party without prior written approval of ICE Data.
Neither ICE Data, its affiliates nor any of its third party suppliers shall have any liability for the accuracy or completeness of the Top Level Data furnished through FRED, or for delays, interruptions or omissions therein nor for any lost profits, direct, indirect, special or consequential damages.
The Top Level Data is not investment advice and a reference to a particular investment or security, a credit rating or any observation concerning a security or investment provided in the Top Level Data is not a recommendation to buy, sell or hold such investment or security or make any other investment decisions.
You shall not use any Indices as a reference index for the purpose of creating financial products (including but not limited to any exchange-traded fund or other passive index-tracking fund, or any other financial instrument whose objective or return is linked in any way to any Index) without prior written approval of ICE Data.
ICE Data, their affiliates or their third party suppliers have exclusive proprietary rights in the Top Level Data and any information and software received in connection therewith.
You shall not use or permit anyone to use the Top Level Data for any unlawful or unauthorized purpose.
Access to the Top Level Data is subject to termination in the event that any agreement between FRED and ICE Data terminates for any reason.
ICE Data may enforce its rights against you as the third-party beneficiary of the FRED Services Terms of Use, even though ICE Data is not a party to the FRED Services Terms of Use.
The FRED Services Terms of Use, including but limited to the limitation of liability, indemnity and disclaimer provisions, shall extend to third party suppliers.`,
    suggestedCitation: 'Ice Data Indices, LLC, ICE BofA BBB US Corporate Index Option-Adjusted Spread [BAMLC0A4CBBB], retrieved from FRED, Federal Reserve Bank of St. Louis; https://fred.stlouisfed.org/series/BAMLC0A4CBBB, April 30, 2026.',
  },
  BAMLC0A3CA: {
    code: 'BAMLC0A3CA',
    title: 'ICE BofA Single-A US Corporate Index Option-Adjusted Spread',
    observations: '0.68',
    observationDate: '2026-04-28',
    updated: 'Apr 29, 2026 9:13 AM CDT',
    nextRelease: 'Apr 30, 2026',
    units: 'Percent, Not Seasonally Adjusted',
    frequency: 'Daily, Close',
    source: 'Ice Data Indices, LLC',
    sourceLink: 'https://www.ice.com/fixed-income-data-services/index-solutions',
    releaseTitle: 'ICE BofA Indices',
    releaseLink: 'https://www.ice.com/fixed-income-data-services/index-solutions',
    fredLink: 'https://fred.stlouisfed.org/series/BAMLC0A3CA',
    notes: `Starting in April 2026, this series will only include 3 years of observations. For more data, go to the source.

This data represents the Option-Adjusted Spread (OAS) of the ICE BofA Single-A US Corporate Index, a subset of the ICE BofA US Corporate Master Index tracking the performance of US dollar denominated investment grade rated corporate debt publicly issued in the US domestic market. This subset includes all securities with a given investment grade rating A.
The ICE BofA OASs are the calculated spreads between a computed OAS index of all bonds in a given rating category and a spot Treasury curve. An OAS index is constructed using each constituent bond's OAS, weighted by market capitalization. When the last calendar day of the month takes place on the weekend, weekend observations will occur as a result of month ending accrued interest adjustments.

Certain indices and index data included in FRED are the property of ICE Data Indices, LLC (“ICE DATA”) and used under license. ICE® IS A REGISTERED TRADEMARK OF ICE DATA OR ITS AFFILIATES AND BOFA® IS A REGISTERED TRADEMARK OF BANK OF AMERICA CORPORATION LICENSED BY BANK OF AMERICA CORPORATION AND ITS AFFILIATES (“BOFA”) AND MAY NOT BE USED WITHOUT BOFA’S PRIOR WRITTEN APPROVAL. ICE DATA, ITS AFFILIATES AND THEIR RESPECTIVE THIRD PARTY SUPPLIERS DISCLAIM ANY AND ALL WARRANTIES AND REPRESENTATIONS, EXPRESS AND/OR IMPLIED, INCLUDING ANY WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE OR USE, INCLUDING WITH REGARD TO THE INDICES, INDEX DATA AND ANY DATA INCLUDED IN, RELATED TO, OR DERIVED THEREFROM. NEITHER ICE DATA, NOR ITS AFFILIATES OR THEIR RESPECTIVE THIRD PARTY PROVIDERS SHALL BE SUBJECT TO ANY DAMAGES OR LIABILITY WITH RESPECT TO THE ADEQUACY, ACCURACY, TIMELINESS OR COMPLETENESS OF THE INDICES OR THE INDEX DATA OR ANY COMPONENT THEREOF. THE INDICES AND INDEX DATA AND ALL COMPONENTS THEREOF ARE PROVIDED ON AN “AS IS” BASIS AND YOUR USE IS AT YOUR OWN RISK. ICE DATA, ITS AFFILIATES AND THEIR RESPECTIVE THIRD PARTY SUPPLIERS DO NOT SPONSOR, ENDORSE, OR RECOMMEND FRED, OR ANY OF ITS PRODUCTS OR SERVICES.

Copyright, 2023, ICE Data Indices. Reproduction of this data in any form is prohibited except with the prior written permission of ICE Data Indices.

The end of day Index values, Index returns, and Index statistics (“Top Level Data”) are being provided for your internal use only and you are not authorized or permitted to publish, distribute or otherwise furnish Top Level Data to any third-party without prior written approval of ICE Data.
Neither ICE Data, its affiliates nor any of its third party suppliers shall have any liability for the accuracy or completeness of the Top Level Data furnished through FRED, or for delays, interruptions or omissions therein nor for any lost profits, direct, indirect, special or consequential damages.
The Top Level Data is not investment advice and a reference to a particular investment or security, a credit rating or any observation concerning a security or investment provided in the Top Level Data is not a recommendation to buy, sell or hold such investment or security or make any other investment decisions.
You shall not use any Indices as a reference index for the purpose of creating financial products (including but not limited to any exchange-traded fund or other passive index-tracking fund, or any other financial instrument whose objective or return is linked in any way to any Index) without prior written approval of ICE Data.
ICE Data, their affiliates or their third party suppliers have exclusive proprietary rights in the Top Level Data and any information and software received in connection therewith.
You shall not use or permit anyone to use the Top Level Data for any unlawful or unauthorized purpose.
Access to the Top Level Data is subject to termination in the event that any agreement between FRED and ICE Data terminates for any reason.
ICE Data may enforce its rights against you as the third-party beneficiary of the FRED Services Terms of Use, even though ICE Data is not a party to the FRED Services Terms of Use.
The FRED Services Terms of Use, including but limited to the limitation of liability, indemnity and disclaimer provisions, shall extend to third party suppliers.`,
    suggestedCitation: 'Ice Data Indices, LLC, ICE BofA Single-A US Corporate Index Option-Adjusted Spread [BAMLC0A3CA], retrieved from FRED, Federal Reserve Bank of St. Louis; https://fred.stlouisfed.org/series/BAMLC0A3CA, April 30, 2026.',
  },
};
