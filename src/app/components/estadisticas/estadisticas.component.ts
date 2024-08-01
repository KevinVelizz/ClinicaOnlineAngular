import { AfterViewInit, Component, ElementRef, viewChild } from '@angular/core';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Chart, ChartType, registerables } from 'chart.js';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { Turno } from '../../interfaces/turno';
import { Timestamp } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { LoaderComponent } from '../loader/loader.component';
import { saveAs } from 'file-saver';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FooterComponent, NavbarComponent, LoaderComponent],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.css'
})
export class EstadisticasComponent implements AfterViewInit {

  turnos: Turno[] = [];
  turnosEspecialidad: string[] = [];
  logs: any[] = [];
  turnosPorDia: string[] = [];
  fechaInicio: string = '';
  fechaFin: string = '';
  
  fechaInicioDos: string = '';
  fechaFinDos: string = '';
  

  constructor(private firestore: FirestoreService, private auth: AuthService) {

    this.firestore.getCollection('sesiones').subscribe(sesiones => {
      this.logs = sesiones;
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.crearGraficoTurnosPorEspecialidad();
      this.crearGraficoTurnosPorDia();
    }, 0);
  }

  convertirTimestampADate(timestamp: any): Date {
    const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    return new Date(milliseconds);
  }

  crearGraficoTurnosPorEspecialidad() {

    this.firestore.getCollection('turnos').subscribe(turnos => {
      turnos = turnos.map(t => { t.fechaTurno = t.fechaTurno instanceof Timestamp ? this.convertirTimestampADate(t.fechaTurno) : t.fechaTurno; return t });
      this.turnos = [...turnos];

      this.turnos.forEach(turno => {
        this.turnosEspecialidad.push(turno.especialidad);
      });

      const especialidadCountMap: { [key: string]: number } = {};

      this.turnosEspecialidad.forEach(especialidad => {
        if (especialidadCountMap[especialidad]) {
          especialidadCountMap[especialidad]++;
        } else {
          especialidadCountMap[especialidad] = 1;
        }
      });
      console.log(especialidadCountMap);

      const especialidadesUnicas = Object.keys(especialidadCountMap);
      const cantidadesEspecialidades = Object.values(especialidadCountMap);

      const ctx = document.getElementById('cantidadTurnosPorEspecialidad') as HTMLCanvasElement;
      if (ctx) {

        ctx.style.height = '300px';
        ctx.style.width = '100%';

        new Chart(ctx, {
          type: 'bar' as ChartType,
          data: {
            labels: especialidadesUnicas,
            datasets: [{
              label: 'Cantidad de Turnos por Especialidad',
              data: cantidadesEspecialidades,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function (tickValue: string | number) {
                    if (typeof tickValue === 'number' && Number.isInteger(tickValue)) {
                      return tickValue.toString();
                    }
                    return '';
                  },
                  stepSize: 1
                }
              }
            }
          }
        });
      } else {
        console.error("No se pudo encontrar el elemento del lienzo para el gráfico");
      }
    });
  }

  descargarExcelLogs() {
    const tableColumn = ['Nombre Usuario', 'Correo Usuario', 'Fecha', 'Hora'];
    const tableRows: any[][] = this.logs.map(log => [
      log.nombreUsuario,
      log.correoUsuario,
      log.diaHorario.fecha,
      log.diaHorario.hora
    ]);
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([tableColumn, ...tableRows]);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Logs': worksheet },
      SheetNames: ['Logs']
    };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Logs_${new Date().toLocaleDateString()}.xlsx`);
  }

  crearGraficoTurnosPorDia() {
    this.firestore.getCollection('turnos').subscribe(turnos => {
      turnos = turnos.map(t => {
        t.fechaTurno = t.fechaTurno instanceof Timestamp ? this.convertirTimestampADate(t.fechaTurno) : t.fechaTurno;
        return t;
      });
      this.turnos = [...turnos];

      this.turnos.forEach(turno => {
        const fecha = new Date(turno.fechaTurno).toISOString().split('T')[0];
        this.turnosPorDia.push(fecha);
      });

      const turnosPorDiaCountMap: { [key: string]: number } = {};

      this.turnosPorDia.forEach(fecha => {
        if (turnosPorDiaCountMap[fecha]) {
          turnosPorDiaCountMap[fecha]++;
        } else {
          turnosPorDiaCountMap[fecha] = 1;
        }
      });
      const fechasUnicas = Object.keys(turnosPorDiaCountMap);
      const cantidadesTurnosPorDia = Object.values(turnosPorDiaCountMap);
      const ctx = document.getElementById('cantidadTurnosPorDia') as HTMLCanvasElement;
      if (ctx) {
        ctx.style.height = '256px';
        ctx.style.width = '256px';
        new Chart(ctx, {
          type: 'pie' as ChartType,
          data: {
            labels: fechasUnicas,
            datasets: [{
              label: 'Cantidad de Turnos por Día',
              data: cantidadesTurnosPorDia,
              backgroundColor: [
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)'
              ],
              borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    const label = tooltipItem.label || '';
                    const value = tooltipItem.raw;
                    return `${label}: ${value} turnos`;
                  }
                }
              }
            }
          }
        });
      } else {
        console.error("No se pudo encontrar el elemento del lienzo para el gráfico");
      }
    });
  }
  
  crearGraficoTurnosPorMedicoRealiazdo() {
    if (!this.fechaInicioDos || !this.fechaFinDos) {
      Swal.fire({
        title: 'Error',
        text: 'Seleccione una fecha de inicio y fin',
        showConfirmButton: true
      });
      return;
    }

    this.firestore.getCollection('turnos').subscribe(turnos => {
      turnos = turnos.map((t: any) => {
        t.fechaTurno = t.fechaTurno instanceof Timestamp ? this.convertirTimestampADate(t.fechaTurno) : t.fechaTurno;
        return t;
      });

      const turnosFiltrados = turnos.filter((turno: any) => 
        turno.estado == 'realizado' &&
        new Date(turno.fechaTurno) >= new Date(this.fechaInicio) &&
        new Date(turno.fechaTurno) <= new Date(this.fechaFin)
      );

      const turnosPorEspecialistaCountMap: { [key: string]: number } = {};
      turnosFiltrados.forEach((turno: any) => {
        const especialistaNombre = `${turno.especialista.nombre} ${turno.especialista.apellido}`;
        if (turnosPorEspecialistaCountMap[especialistaNombre]) {
          turnosPorEspecialistaCountMap[especialistaNombre]++;
        } else {
          turnosPorEspecialistaCountMap[especialistaNombre] = 1;
        }
      });

      const especialistasUnicos = Object.keys(turnosPorEspecialistaCountMap);
      const cantidadesTurnosPorEspecialista = Object.values(turnosPorEspecialistaCountMap);

      const ctx = document.getElementById('cantidadTurnosPorMedicoRealizado') as HTMLCanvasElement;
      if (ctx) {
        ctx.style.height = '300px';
        ctx.style.width = '300px';

        new Chart(ctx, {
          type: 'bar' as ChartType,
          data: {
            labels: especialistasUnicos,
            datasets: [{
              label: 'Cantidad de Turnos realizados por Médico',
              data: cantidadesTurnosPorEspecialista,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              x: {
                beginAtZero: true,
                ticks: {
                  autoSkip: false, 
                },
                grid: {
                  display: false 
                }
              },
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1, 
                  callback: function (value) {
                    return value; 
                  }
                },
                grid: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.1)',
                  lineWidth: 1
                }
              }
            },
            plugins: {
              legend: {
                position: 'top' as const,
              },
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    const label = tooltipItem.label || '';
                    const value = tooltipItem.raw  as number;
                    return `${label}: ${Math.round(value)} turnos`;
                  }
                }
              }
            }
          }
        });
      } else {
        console.error("No se pudo encontrar el elemento del lienzo para el gráfico");
      }
    });
  }

  descargarExcelCantidadTurno() {
    this.firestore.getCollection('turnos').subscribe(turnos => {
      turnos = turnos.map(t => {
        t.fechaTurno = t.fechaTurno instanceof Timestamp ? this.convertirTimestampADate(t.fechaTurno) : t.fechaTurno;
        return t;
      });
      this.turnos = [...turnos];

      const especialidadCountMap: { [key: string]: number } = {};
      this.turnos.forEach(turno => {
        const especialidad = turno.especialidad;
        if (especialidadCountMap[especialidad]) {
          especialidadCountMap[especialidad]++;
        } else {
          especialidadCountMap[especialidad] = 1;
        }
      });

      const especialidadesUnicas = Object.keys(especialidadCountMap);
      const cantidadesEspecialidades = Object.values(especialidadCountMap);

      const tableColumn = ['Especialidad', 'Cantidad Turnos'];
      const tableRows: any[][] = especialidadesUnicas.map((especialidad, index) => [
        especialidad,
        cantidadesEspecialidades[index]
      ]);

      const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([tableColumn, ...tableRows]);
      const workbook: XLSX.WorkBook = {
        Sheets: { 'Turnos por Especialidad': worksheet },
        SheetNames: ['Turnos por Especialidad']
      };

      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, `Cantidad_Turnos_Por_Especialidad_${new Date().toLocaleDateString()}.xlsx`);
    });
  }

  descargarExcelCantidadTurnoPorDia() {
    this.firestore.getCollection('turnos').subscribe(turnos => {
      turnos = turnos.map(t => {
        t.fechaTurno = t.fechaTurno instanceof Timestamp ? this.convertirTimestampADate(t.fechaTurno) : t.fechaTurno;
        return t;
      });
      this.turnos = [...turnos];

      const turnosPorDiaCountMap: { [key: string]: number } = {};
      this.turnos.forEach(turno => {
        const fecha = new Date(turno.fechaTurno).toISOString().split('T')[0];
        if (turnosPorDiaCountMap[fecha]) {
          turnosPorDiaCountMap[fecha]++;
        } else {
          turnosPorDiaCountMap[fecha] = 1;
        }
      });

      const fechasUnicas = Object.keys(turnosPorDiaCountMap);
      const cantidadesTurnosPorDia = Object.values(turnosPorDiaCountMap);

      const tableColumn = ['Fecha', 'Cantidad turnos'];
      const tableRows: any[][] = fechasUnicas.map((fecha, index) => [
        fecha,
        cantidadesTurnosPorDia[index]
      ]);

      const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([tableColumn, ...tableRows]);
      const workbook: XLSX.WorkBook = {
        Sheets: { 'Turnos por Día': worksheet },
        SheetNames: ['Turnos por Día']
      };

      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, `Cantidad_Turnos_Por_Dia_${new Date().toLocaleDateString()}.xlsx`);
    });
  }

  descargarPDFCantidadTurno() {
    this.firestore.getCollection('turnos').subscribe(turnos => {
      turnos = turnos.map(t => {
        t.fechaTurno = t.fechaTurno instanceof Timestamp ? this.convertirTimestampADate(t.fechaTurno) : t.fechaTurno;
        return t;
      });
      this.turnos = [...turnos];

      const especialidadCountMap: { [key: string]: number } = {};
      this.turnos.forEach(turno => {
        const especialidad = turno.especialidad;
        if (especialidadCountMap[especialidad]) {
          especialidadCountMap[especialidad]++;
        } else {
          especialidadCountMap[especialidad] = 1;
        }
      });

      const especialidadesUnicas = Object.keys(especialidadCountMap);
      const cantidadesEspecialidades = Object.values(especialidadCountMap);

      const tableColumn = ['Especialidad', 'Cantidad turnos'];
      const tableRows: any[][] = especialidadesUnicas.map((especialidad, index) => [
        especialidad,
        cantidadesEspecialidades[index]
      ]);

      const doc = new jsPDF();

      doc.text('Informe de Turnos por Especialidad', 10, 10);
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 10, 20);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        margin: { left: 10, right: 10 },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 160, 133] },
        theme: 'striped',
      });

      doc.save(`Cantidad_Turnos_Por_Especialidad_${new Date().toLocaleDateString()}.pdf`);
    });
  }

  descargarExcelTurnosPorMedicoRealizado() {
    if (!this.fechaInicioDos || !this.fechaFinDos) {
      Swal.fire({
        title: 'Error',
        text: 'Seleccione una fecha de inicio y fin',
        showConfirmButton: true
      });
      return;
    }

    this.firestore.getCollection('turnos').subscribe(turnos => {
      turnos = turnos.map((t: any) => {
        t.fechaTurno = t.fechaTurno instanceof Timestamp ? this.convertirTimestampADate(t.fechaTurno) : t.fechaTurno;
        return t;
      });

      const turnosFiltrados = turnos.filter((turno: any) => 
        turno.estado === 'realizado' &&
        new Date(turno.fechaTurno) >= new Date(this.fechaInicio) &&
        new Date(turno.fechaTurno) <= new Date(this.fechaFin)
      );

      const turnosPorEspecialistaCountMap: { [key: string]: number } = {};
      turnosFiltrados.forEach((turno: any) => {
        const especialistaNombre = turno.especialista.nombre;
        if (turnosPorEspecialistaCountMap[especialistaNombre]) {
          turnosPorEspecialistaCountMap[especialistaNombre]++;
        } else {
          turnosPorEspecialistaCountMap[especialistaNombre] = 1;
        }
      });

      const especialistasUnicos = Object.keys(turnosPorEspecialistaCountMap);
      const cantidadesTurnosPorEspecialista = Object.values(turnosPorEspecialistaCountMap);

      const tableColumn = ['Especialista', 'Cantidad Turnos'];
      const tableRows: any[][] = especialistasUnicos.map((especialista, index) => [
        especialista,
        cantidadesTurnosPorEspecialista[index]
      ]);

      const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([tableColumn, ...tableRows]);
      const workbook: XLSX.WorkBook = {
        Sheets: { 'Turnos por Especialista': worksheet },
        SheetNames: ['Turnos por Especialista']
      };

      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, `Cantidad_Turnos_realizado_Por_Especialista_${new Date().toLocaleDateString()}.xlsx`);
    });
  }

  crearGraficoTurnosPorMedicoSolicitado() {
    if (!this.fechaInicio || !this.fechaFin) {
      Swal.fire({
        title: 'Error',
        text: 'Seleccione una fecha de inicio y fin',
        showConfirmButton: true
      });
      return;
    }

    this.firestore.getCollection('turnos').subscribe(turnos => {
      turnos = turnos.map((t: any) => {
        t.fechaTurno = t.fechaTurno instanceof Timestamp ? this.convertirTimestampADate(t.fechaTurno) : t.fechaTurno;
        return t;
      });

      const turnosFiltrados = turnos.filter((turno: any) => 
        turno.estado !== 'realizado' &&
        new Date(turno.fechaTurno) >= new Date(this.fechaInicio) &&
        new Date(turno.fechaTurno) <= new Date(this.fechaFin)
      );

      const turnosPorEspecialistaCountMap: { [key: string]: number } = {};
      turnosFiltrados.forEach((turno: any) => {
        const especialistaNombre = `${turno.especialista.nombre} ${turno.especialista.apellido}`;
        if (turnosPorEspecialistaCountMap[especialistaNombre]) {
          turnosPorEspecialistaCountMap[especialistaNombre]++;
        } else {
          turnosPorEspecialistaCountMap[especialistaNombre] = 1;
        }
      });

      const especialistasUnicos = Object.keys(turnosPorEspecialistaCountMap);
      const cantidadesTurnosPorEspecialista = Object.values(turnosPorEspecialistaCountMap);

      const ctx = document.getElementById('cantidadTurnosPorMedicoSolicitado') as HTMLCanvasElement;
      if (ctx) {
        ctx.style.height = '300px';
        ctx.style.width = '300px';

        new Chart(ctx, {
          type: 'bar' as ChartType,
          data: {
            labels: especialistasUnicos,
            datasets: [{
              label: 'Cantidad de Turnos Solicitados por Médico',
              data: cantidadesTurnosPorEspecialista,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              x: {
                beginAtZero: true,
                ticks: {
                  autoSkip: false, 
                },
                grid: {
                  display: false 
                }
              },
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1, 
                  callback: function (value) {
                    return value; 
                  }
                },
                grid: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.1)',
                  lineWidth: 1
                }
              }
            },
            plugins: {
              legend: {
                position: 'top' as const,
              },
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    const label = tooltipItem.label || '';
                    const value = tooltipItem.raw as number;
                    return `${label}: ${Math.round(value)} turnos`;
                  }
                }
              }
            }
          }
        });
      } else {
        console.error("No se pudo encontrar el elemento del lienzo para el gráfico");
      }
    });
  }

  descargarExcelTurnosPorMedicoSolicitado() {
    if (!this.fechaInicio || !this.fechaFin) {
      Swal.fire({
        title: 'Error',
        text: 'Seleccione una fecha de inicio y fin',
        showConfirmButton: true
      });
      return;
    }

    this.firestore.getCollection('turnos').subscribe(turnos => {
      turnos = turnos.map((t: any) => {
        t.fechaTurno = t.fechaTurno instanceof Timestamp ? this.convertirTimestampADate(t.fechaTurno) : t.fechaTurno;
        return t;
      });

      const turnosFiltrados = turnos.filter((turno: any) => 
        turno.estado !== 'realizado' &&
        new Date(turno.fechaTurno) >= new Date(this.fechaInicio) &&
        new Date(turno.fechaTurno) <= new Date(this.fechaFin)
      );

      const turnosPorEspecialistaCountMap: { [key: string]: number } = {};
      turnosFiltrados.forEach((turno: any) => {
        const especialistaNombre = `${turno.especialista.nombre} ${turno.especialista.apellido}`;
        if (turnosPorEspecialistaCountMap[especialistaNombre]) {
          turnosPorEspecialistaCountMap[especialistaNombre]++;
        } else {
          turnosPorEspecialistaCountMap[especialistaNombre] = 1;
        }
      });

      const especialistasUnicos = Object.keys(turnosPorEspecialistaCountMap);
      const cantidadesTurnosPorEspecialista = Object.values(turnosPorEspecialistaCountMap);

      const tableColumn = ['Especialista', 'Cantidad Turnos'];
      const tableRows: any[][] = especialistasUnicos.map((especialista, index) => [
        especialista,
        cantidadesTurnosPorEspecialista[index]
      ]);

      const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([tableColumn, ...tableRows]);
      const workbook: XLSX.WorkBook = {
        Sheets: { 'Turnos por Especialista': worksheet },
        SheetNames: ['Turnos por Especialista']
      };

      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, `Cantidad_Turnos_Solicitado_Por_Especialista_${new Date().toLocaleDateString()}.xlsx`);
    });
  }
}
