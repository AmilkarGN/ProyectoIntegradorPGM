import { Component, HostListener, AfterViewInit, ElementRef, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class Landing implements AfterViewInit {
  isScrolled = false;
  isNavigating = false; // Controla la pantalla de "Calculando ruta"

  // Valores finales de tu impacto
  maxToneladas = 15000;
  maxViajes = 850;
  maxClientes = 45;

  // Variables que inician en 0 y se animan
  toneladas = 0;
  viajes = 0;
  clientes = 0;
  
  toneladasPercent = 0;
  viajesPercent = 0;
  clientesPercent = 0;

  constructor(
    private el: ElementRef, 
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled = window.scrollY > 50;
    }
  }

  // Animación del Navbar
  scrollToSection(sectionId: string) {
    if (isPlatformBrowser(this.platformId)) {
      this.isNavigating = true; // Prende la pantalla láser
      
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setTimeout(() => this.isNavigating = false, 400); // Apaga la pantalla
      }, 800);
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateStats();
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      const statsSection = this.el.nativeElement.querySelector('#estadisticas');
      if (statsSection) counterObserver.observe(statsSection);
    }
  }

  // El motor matemático de los anillos y números
  animateStats() {
    const duration = 2000; 
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      this.toneladas = Math.floor(this.maxToneladas * progress);
      this.viajes = Math.floor(this.maxViajes * progress);
      this.clientes = Math.floor(this.maxClientes * progress);

      this.toneladasPercent = Math.floor(100 * progress);
      this.viajesPercent = Math.floor(85 * progress); 
      this.clientesPercent = Math.floor(90 * progress);

      if (currentStep >= steps) clearInterval(timer);
    }, interval);
  }
}