import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSwitcher } from './profile-switcher';

describe('ProfileSwitcher', () => {
  let component: ProfileSwitcher;
  let fixture: ComponentFixture<ProfileSwitcher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileSwitcher]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileSwitcher);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
