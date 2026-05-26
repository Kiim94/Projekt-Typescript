import { TestBed } from '@angular/core/testing';

import { CourseSchedule } from './course-schedule';

describe('CourseSchedule', () => {
  let service: CourseSchedule;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourseSchedule);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
