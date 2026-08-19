import assert from "node:assert/strict";
import { PROGRAM } from "../js/data/program-data.js";
import { PROGRAM_CONTENT, getExerciseDetail, getGuideList } from "../js/data/program-content.js";
import { renderProgram, getProgramExerciseSheet, getProgramGuideSheet } from "../js/views/program.js";

const exercises = Object.values(PROGRAM.workouts).flatMap((workout) => workout.exercises);
assert.equal(exercises.length, 30, "Program 30 exercise slot içermeli");
assert.equal(Object.keys(PROGRAM_CONTENT.exerciseDetails).length, 30, "Her slot için rehber kaydı olmalı");

for (const exercise of exercises) {
  const detail = getExerciseDetail(exercise.slotId);
  assert.ok(detail, `${exercise.slotId} için detail eksik`);
  assert.ok(Array.isArray(detail.alternatives) && detail.alternatives.length > 0, `${exercise.slotId} alternatives eksik`);
  assert.ok(Array.isArray(detail.techniqueSections) && detail.techniqueSections.length > 0, `${exercise.slotId} teknik bölüm eksik`);
  assert.ok(detail.techniqueSections.every((section) => Array.isArray(section.tips) && section.tips.length > 0), `${exercise.slotId} teknik notları eksik`);

  const sheet = getProgramExerciseSheet(exercise.slotId);
  assert.ok(sheet?.title, `${exercise.slotId} sheet title eksik`);
  assert.match(sheet.body, /Alternatifler/, `${exercise.slotId} sheet alternatifleri göstermeli`);
}

const guides = getGuideList();
assert.deepEqual(guides.map((guide) => guide.id), ["principles", "progression", "warmup", "recovery", "safety"]);

for (const guide of guides) {
  const sheet = getProgramGuideSheet(guide.id);
  assert.ok(sheet?.body?.length > 100, `${guide.id} guide sheet eksik`);
}

assert.match(getProgramGuideSheet("progression").body, /Tüm setler hedef tekrar aralığında/);
assert.match(getProgramGuideSheet("warmup").body, /Hazırlık setleri haftalık hacme dahil değildir/);
assert.match(getProgramGuideSheet("recovery").body, /%30–50/);
assert.match(getProgramGuideSheet("safety").body, /Teknik &gt; ağırlık|Teknik > ağırlık/);

for (const workout of Object.values(PROGRAM.workouts)) {
  const html = renderProgram(`program/${workout.id}`);
  const buttonCount = (html.match(/data-action="open-program-exercise-info"/g) ?? []).length;
  assert.equal(buttonCount, workout.exercises.length, `${workout.id} tüm egzersizlerde info butonu göstermeli`);
}

const overview = renderProgram("program");
assert.equal((overview.match(/data-action="open-program-guide"/g) ?? []).length, 5, "Program ana ekranında 5 rehber kartı olmalı");
assert.match(overview, /Program Rehberi/);

console.log("FAZ 7 program content tests passed.");
