@NgModule({
    providers: [
        { 
            provide: HTTP_INTERCEPTORS, 
            useClass: ErrorInterceptor, 
            multi: true 
        },
        // Otros interceptores...
    ]
})
export class AppModule { } 