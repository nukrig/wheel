import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Wheel } from 'spin-wheel-ts';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'app.html',
  styleUrl:'app.css'
})
export class App implements AfterViewInit {
  @ViewChild('wheelContainer', { static: true }) container!: ElementRef<HTMLDivElement>;
  wheel!: Wheel;
  resultText: string = '';

  items: any = [
    
    { label: 'iPhone', backgroundColor: '#e91e63' ,image: 'iphone.png',imageScale : .2},
    { label: 'AirPods', backgroundColor: '#2196f3',image: 'airpods.png',imageScale : .2},
    { label: '999 999$', backgroundColor:'#4caf50'  ,image: 'money.png',imageScale : .2 },
    { label: 'PowerBank', backgroundColor: '#cac82bff',image: 'powerbank.png',imageScale : .2 },
    { label: 'Discount 5%', backgroundColor: '#ff9800',image: 'discount.png',imageScale : .2 },
    
  ];
  

  ngAfterViewInit() {
    if (!this.container) return;

    // create wheel
   this.wheel = new Wheel(this.container.nativeElement, {
      items: this.items,
      itemLabelRotation:90,
      itemLabelAlign:'center',
      pointerAngle: 0,
      
    });
  }

  spin() {
    this.resultText = ''
    if (!this.wheel) return;
    const target = Math.floor(Math.random() * this.items.length);
    this.wheel.spinToItem(target, 2000, true, 5);
    console.log('Spinning to:', this.items[target].label);
    setTimeout(() => {
      this.resultText = this.items[target].label
    }, 2000);
    
  }
}
