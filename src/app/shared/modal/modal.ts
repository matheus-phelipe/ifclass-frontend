import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],  
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class ModalComponent implements AfterViewInit {
  @Input() id: string = '';
  @Input() title: string = 'Mensagem';
  @Input() message: string = '';

  @ViewChild('modalRef', { static: false }) modalRef!: ElementRef;

  private bsModal: any;

  ngAfterViewInit(): void {
    this.bsModal = new bootstrap.Modal(this.modalRef.nativeElement);
  }

  public open(): void {
    this.bsModal.show();
  }

  public close(): void {
    this.bsModal.hide();
  }
}
