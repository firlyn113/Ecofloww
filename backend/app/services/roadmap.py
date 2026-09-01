from app.models.base import ProductTemplate, RoadmapProgress

class RoadmapService:
    """Generate & track roadmap pengolahan produk eco-enzyme."""

    @staticmethod
    def generate_roadmap(product_template_id: int, db) -> dict:
        """Generate langkah-langkah roadmap dari template produk.

        Args:
            product_template_id: ID template produk (1-8 memiliki langkah khusus).
            db: SQLAlchemy session.

        Returns:
            dict: {"template_name", "time_estimate_hours", "safety_warnings",
                   "steps": [{"title", "description", "details", "completed"}]}.

        Raises:
            ValueError: Jika template tidak ditemukan.
        """
        template = db.query(ProductTemplate).filter(ProductTemplate.id == product_template_id).first()
        if not template:
            raise ValueError("Template produk tidak ditemukan")

        steps = []
        
        steps.append({
            "title": "Pengumpulan Bahan Baku",
            "description": "Kumpulkan semua bahan yang diperlukan.",
            "details": f"Bahan yang diperlukan: {', '.join(template.ingredients) if template.ingredients else 'Tidak ada yang terdaftar'}",
            "completed": False
        })
        
        steps.append({
            "title": "Penyiapan Peralatan",
            "description": "Pastikan semua peralatan bersih dan siap digunakan.",
            "details": f"Peralatan yang diperlukan: {', '.join(template.equipment) if template.equipment else 'Tidak ada yang terdaftar'}",
            "completed": False
        })
        
        if template.id == 1:
            steps.extend([
                {"title": "Pengenceran", "description": "Encerkan 1:10 dengan air.", "details": "Campurkan eco-enzyme dengan air secara merata.", "completed": False},
                {"title": "Pengemasan Botol", "description": "Pindahkan ke dalam botol semprot.", "details": "Isi botol semprot dengan hati-hati.", "completed": False}
            ])
        elif template.id == 2:
            steps.extend([
                {"title": "Persiapan", "description": "Gunakan sarung tangan pelindung.", "details": "Selalu gunakan sarung tangan untuk larutan pekat.", "completed": False},
                {"title": "Pengenceran", "description": "Encerkan 1:5 dengan air.", "details": "Campurkan larutan secara akurat.", "completed": False}
            ])
        elif template.id == 3:
            steps.extend([
                {"title": "Pengenceran", "description": "Encerkan 1:100 dengan air.", "details": "Siapkan campuran pupuk cair.", "completed": False},
                {"title": "Persiapan Aplikasi", "description": "Pindahkan ke gembor/alat penyiram.", "details": "Siapkan alat penyiram untuk pengaplikasian.", "completed": False}
            ])
        elif template.id == 4:
            steps.extend([
                {"title": "Pengenceran", "description": "Encerkan 1:10 dengan air.", "details": "Siapkan campuran pengusir hama.", "completed": False},
                {"title": "Pengujian", "description": "Uji coba pada area kecil terlebih dahulu.", "details": "Semprotkan ke satu helai daun terlebih dahulu.", "completed": False}
            ])
        elif template.id == 5:
            steps.extend([
                {"title": "Pengukuran Takaran", "description": "Ukur takaran yang dibutuhkan.", "details": "Gunakan larutan murni tanpa pengenceran.", "completed": False},
                {"title": "Pengaplikasian", "description": "Tuangkan ke saluran pembuangan.", "details": "Diamkan semalaman.", "completed": False}
            ])
        elif template.id == 6:
            steps.extend([
                {"title": "Pengenceran", "description": "Encerkan 1:20 dengan air.", "details": "Campurkan larutan penetral bau.", "completed": False},
                {"title": "Pengujian", "description": "Uji pada permukaan kain.", "details": "Uji coba pada bagian yang tidak mencolok.", "completed": False}
            ])
        elif template.id == 7:
            steps.extend([
                {"title": "Penyaringan", "description": "Saring eco-enzyme hingga bersih.", "details": "Pastikan tidak ada partikel besar.", "completed": False},
                {"title": "Pencampuran", "description": "Campurkan dengan minyak pembawa dan minyak esensial.", "details": "Ikuti panduan formula kosmetik.", "completed": False},
                {"title": "Uji Tempel Kulit", "description": "Lakukan uji tempel pada kulit.", "details": "Oleskan sedikit pada kulit dan tunggu 24 jam.", "completed": False}
            ])
        elif template.id == 8:
            steps.extend([
                {"title": "Konsultasi Ahli", "description": "Konsultasikan dengan dokter hewan.", "details": "Pastikan takaran dosis dengan tenaga profesional.", "completed": False},
                {"title": "Pengenceran", "description": "Encerkan 1:200 dengan air.", "details": "Campurkan aditif secara merata.", "completed": False},
                {"title": "Pencampuran Pakan", "description": "Campurkan ke dalam pakan ternak.", "details": "Pastikan persebaran merata.", "completed": False}
            ])
        else:
            steps.append({"title": "Pemrosesan", "description": "Ikuti instruksi pemrosesan.", "details": template.processing_instructions, "completed": False})

        return {
            "template_name": template.name,
            "time_estimate_hours": template.time_estimate_hours,
            "safety_warnings": template.safety_warnings,
            "steps": steps
        }

    @staticmethod
    def update_step_status(roadmap: RoadmapProgress, step_index: int, completed: bool, db) -> dict:
        """Update status satu step dan recompute progres roadmap.

        Transisi status: 0 selesai -> not_started; semua selesai -> completed;
        sebagian -> in_progress. `started_at`/`completed_at` di-set sekali.

        Raises:
            ValueError: Jika step_index di luar rentang.
        """
        from sqlalchemy.orm.attributes import flag_modified
        
        if step_index < 0 or step_index >= len(roadmap.steps_json):
            raise ValueError("Indeks langkah tidak valid")

        steps = roadmap.steps_json.copy()
        steps[step_index]["completed"] = completed
        roadmap.steps_json = steps
        
        # Mark JSON field as modified for SQLAlchemy to detect change
        flag_modified(roadmap, "steps_json")

        total_steps = len(steps)
        completed_steps = sum(1 for step in steps if step.get("completed", False))

        if completed_steps == 0:
            roadmap.status = "not_started"
            roadmap.current_step = 0
            roadmap.completed_at = None
        elif completed_steps == total_steps:
            roadmap.status = "completed"
            roadmap.current_step = total_steps - 1
            if completed and roadmap.completed_at is None:
                from app.models.base import utcnow
                roadmap.completed_at = utcnow()
        else:
            roadmap.status = "in_progress"
            roadmap.current_step = max((i for i, step in enumerate(steps) if step.get("completed", False)), default=0) + (1 if completed else 0)
            if roadmap.current_step >= total_steps:
                roadmap.current_step = total_steps - 1
            roadmap.completed_at = None

        if completed_steps > 0 and roadmap.started_at is None:
            from app.models.base import utcnow
            roadmap.started_at = utcnow()
            
        db.commit()
        db.refresh(roadmap)

        return RoadmapService.get_progress_summary(roadmap)

    @staticmethod
    def get_progress_summary(roadmap: RoadmapProgress) -> dict:
        """Ringkasan progres roadmap: status, step aktif, persentase, steps."""
        total_steps = len(roadmap.steps_json)
        completed_steps = sum(1 for step in roadmap.steps_json if step.get("completed", False))
        progress_percentage = (completed_steps / total_steps * 100) if total_steps > 0 else 0

        return {
            "id": roadmap.id,
            "batch_id": roadmap.batch_id,
            "product_template_id": roadmap.product_template_id,
            "status": roadmap.status,
            "current_step": roadmap.current_step,
            "total_steps": total_steps,
            "completed_steps": completed_steps,
            "progress_percentage": round(progress_percentage, 2),
            "steps": roadmap.steps_json,
            "started_at": roadmap.started_at.isoformat() if roadmap.started_at else None,
            "completed_at": roadmap.completed_at.isoformat() if roadmap.completed_at else None
        }
