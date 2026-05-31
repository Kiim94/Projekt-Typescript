import { Component, signal, computed, effect } from '@angular/core';

//importerar service från course. Där finns också interface för kurser 
import { CourseService, Course } from "../services/course";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.html',
  styleUrl: './courses.scss',
})

export class CoursesComponent {
  //kurser sparas i array-minne
  courses = signal<Course[]>([]);

  searchPhrase = signal<string>("");

  //för sortering av kolumner. Utgår initialt från första kolumnen "code", a-ö. 
  sortCourses = signal<keyof Course>("courseCode");

  //sortering: grundläga = true, mao stigande (A-Ö)
  sortAsc= signal<boolean>(true);

  //hade problem med att se tabell. Använde denna nedan för att se om ngt ändrades
  loading= signal<boolean>(true);

  //meddelande för att lägga till kurs
  /*Hade inte signal för dessa innan. Fungerade ok, men hanterade meddelandena konstigt(försvann inte).
  Testade signal. Fungerade utan problem.*/
  message = signal("");
  isSuccess = signal(true);

  //pagination
  currentPage = signal(1);
  itemsPerPage = 20;

  //signal för att ändra vilket ämne man tittar på från select
  selectedSubject = signal<string>("Alla kurser");


  //===COMPUTED/UTRÄKNINGAR===
  paginatedCourses = computed(() => {
    const start = (this.currentPage() -1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    return this.filteredCourses().slice(start,end);
  })

  subjects = computed(() => {
    //går igenom alla kurser, plockat ut alla subject delar
    //t.ex. { subject: "Datateknik"} => "Datateknik"
    const all = this.courses().map(c => c.subject);
    //new Set: tar bort dubbletter
    //... = spread operator. Används för att "packa ihop" igen.
    //innan: ["datateknik", "matematik", "datateknik"]
    //set städar igenom, tar bort dubbletter
    //... framför gör det till en vanlig lista igen: ["datateknik", "matematik"] men utan dubletter
    return ["Alla kurser", ...new Set(all)];
  })

  //===CONSTRUCTOR = Bygg på en gång===
  constructor(private courseService: CourseService){
    this.courseService.getCourses().subscribe(data => {
      this.courses.set(data);
      this.loading.set(false);
    });

    effect(() => {
      const subject = this.selectedSubject();
      const search = this.searchPhrase();
      console.log("RESET PAGE")
      this.currentPage.set(1);
    })
  }

  //===METODER===
  //metod som ska räkna ut automatiskt:
  filteredCourses = computed(() => {
    let result = this.courses();
    //om valda ämne att sortera efter inte är alla, filtera efter valt ämne
    if(this.selectedSubject() !=="Alla kurser"){
      result = result.filter(c => 
        c.subject === this.selectedSubject()
      )
    }
    //SÖKFILTER
    const phrase = this.searchPhrase().toLowerCase().trim();

    //om sökning gjorts: visa resultat efter filtrering
    if(phrase){
      result = result.filter(c =>
        c.courseCode.toLowerCase().includes(phrase) ||
        c.courseName.toLowerCase().includes(phrase) || 
        c.level.toLowerCase().includes(phrase) ||
        c.subject.toLowerCase().includes(phrase)
      );
    }
    //SORTERING
    const key = this.sortCourses();
    const asc = this.sortAsc();

    //returnera resultat: sortera
    return [...result].sort((a,b) => {
      if(key === "points"){
        const aNum = Number(a.points);
        const bNum = Number(b.points);
        return asc ? aNum - bNum : bNum - aNum;
      }
      
      const aValue = String(a[key]).toLowerCase();
      const bValue = String(b[key]).toLowerCase();

      if (aValue < bValue) return asc ? -1 : 1;
      if (aValue > bValue) return asc ? 1 : -1;
      return 0;
    });
  });

  //uppdatera searchPhrases signal så den har det nya värdet
  //t.ex. användaren söker på "javascript". Nytt värde är javascript
  setSearch(value: string){
    this.searchPhrase.set(value);
  }

  //sortera tabell efter den kolumn användaren klickade på
  sortBy(field: keyof Course) {

    if (this.sortCourses() === field) {
      this.sortAsc.update(v => !v);
    } else {
      this.sortCourses.set(field);
      this.sortAsc.set(true);
    }
  }


  //lägg till kurser till localstorage
  addToSchedule(course: Course){
    //hämta sparade kurser: är en array
    const savedCourses: Course[] = JSON.parse(localStorage.getItem("courses") || "[]");
    
    //variabel: ifall en kurs redan finns med i listan
    const courseExists = savedCourses.some((c: Course) => c.courseCode === course.courseCode);

    if(courseExists){
      this.showMessage("Kursen finns redan i schemat!", false);
      return;
    }
    
    //lägg till kurs
    savedCourses.push(course);
    //spara tillbaka
    localStorage.setItem("courses",JSON.stringify(savedCourses));
    this.showMessage("Kurs tillagd!", true);
  }
  //visa meddelande om kurs finns tillagd/blir tillagd
  showMessage(text: string, success:boolean){
    this.message.set(text);
    this.isSuccess.set(success);
    console.log("SET:", this.message);

    setTimeout(() => {
      this.message.set("");
    }, 3000);
  }


  //pagination: visa fler sidor
  nextPage(){
    this.currentPage.update(page => page + 1);
  }
  prevPage(){
    if(this.currentPage() > 1){
      this.currentPage.update(page => page - 1);
    }
  }
}