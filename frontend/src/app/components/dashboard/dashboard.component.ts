import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Dashboard</h1>
        <button (click)="logout()" class="logout-button">Logout</button>
      </header>
      
      <main class="dashboard-content">
        <div class="welcome-card">
          <h2>Welcome to your Dashboard!</h2>
          <p>You have successfully logged in.</p>
          <div *ngIf="currentUser$ | async as user" class="user-info">
            <p><strong>Name:</strong> {{ user.name }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #f7fafc;
    }

    .dashboard-header {
      background: white;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;

      h1 {
        margin: 0;
        color: #2d3748;
      }
    }

    .logout-button {
      background: #e53e3e;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;

      &:hover {
        background: #c53030;
      }
    }

    .dashboard-content {
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-card {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      text-align: center;

      h2 {
        color: #2d3748;
        margin-bottom: 16px;
      }

      p {
        color: #718096;
        margin-bottom: 24px;
      }
    }

    .user-info {
      background: #f7fafc;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;

      p {
        margin: 8px 0;
        color: #4a5568;
      }
    }
  `]
})
export class DashboardComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get currentUser$() {
    return this.authService.currentUser$;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 