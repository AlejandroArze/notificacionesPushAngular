import { Injectable } from '@angular/core';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import { faqCategories, faqs, guideCategories, guides } from 'app/mock-api/apps/help-center/data';
import { cloneDeep } from 'lodash-es';

@Injectable({providedIn: 'root'})
export class HelpCenterMockApi
{
    private _faqCategories: any[] = faqCategories;
    private _faqs: any[] = faqs;
    private _guideCategories: any[] = guideCategories;
    private _guides: any[] = guides;

    /**
     * Constructor
     */
    constructor(private _fuseMockApiService: FuseMockApiService)
    {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void
    {
        // -----------------------------------------------------------------------------------------------------
        // @ FAQs - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/help-center/faqs')
            .reply(({request}) =>
            {
                // Get the category slug
                const slug = request.params.get('slug');

                // Clone the faq categories and faqs
                const categories = cloneDeep(this._faqCategories);
                const faqs = cloneDeep(this._faqs);

                // Prepare the results
                const results = categories.map(category => ({
                    ...category,
                    faqs: faqs.filter(faq => faq.categoryId === category.id)
                }));

                // If slug is provided, filter results
                if (slug) {
                    return [200, results.filter(category => category.slug === slug)];
                }

                // Return all results
                return [200, results];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Guides - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/help-center/guides')
            .reply(({request}) =>
            {
                // Get the slug & limit
                const slug = request.params.get('slug');
                const limit = parseInt(request.params.get('limit') || '5', 10);

                // Clone the guide categories and guides
                const categories = cloneDeep(this._guideCategories);
                const guides = cloneDeep(this._guides);

                // Prepare the results
                const results = categories.map(category => {
                    const categoryGuides = guides.filter(guide => guide.categoryId === category.id);
                    return {
                        ...category,
                        guides: slug ? categoryGuides : categoryGuides.slice(0, limit),
                        totalGuides: categoryGuides.length,
                        visibleGuides: slug ? categoryGuides.length : limit
                    };
                });

                // If slug is provided, filter results
                if (slug) {
                    return [200, results.filter(category => category.slug === slug)];
                }

                // Return all results
                return [200, results];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Guide - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/help-center/guide')
            .reply(({request}) =>
            {
                // Get the slugs
                const categorySlug = request.params.get('categorySlug');
                const guideSlug = request.params.get('guideSlug');

                // Clone the guide categories and guides
                const categories = cloneDeep(this._guideCategories);
                const guides = cloneDeep(this._guides);

                // Find the category and guide
                const category = categories.find(item => item.slug === categorySlug);
                const guide = guides.find(item => item.categoryId === category?.id && item.slug === guideSlug);

                // Return the response
                return [200, {
                    ...category,
                    guides: guide ? [guide] : []
                }];
            });
    }
}
