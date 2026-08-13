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
            raise ValueError("Product template not found")

        steps = []
        
        steps.append({
            "title": "Gathering Ingredients",
            "description": "Collect all necessary ingredients.",
            "details": f"Ingredients required: {', '.join(template.ingredients) if template.ingredients else 'None listed'}",
            "completed": False
        })
        
        steps.append({
            "title": "Preparing Equipment",
            "description": "Ensure all equipment is clean and ready.",
            "details": f"Equipment required: {', '.join(template.equipment) if template.equipment else 'None listed'}",
            "completed": False
        })
        
        if template.id == 1:
            steps.extend([
                {"title": "Dilution", "description": "Dilute 1:10 with water.", "details": "Mix the eco-enzyme with water properly.", "completed": False},
                {"title": "Bottling", "description": "Transfer to spray bottles.", "details": "Fill spray bottles carefully.", "completed": False}
            ])
        elif template.id == 2:
            steps.extend([
                {"title": "Preparation", "description": "Put on gloves.", "details": "Always use gloves for concentrated solutions.", "completed": False},
                {"title": "Dilution", "description": "Dilute 1:5 with water.", "details": "Mix the solution accurately.", "completed": False}
            ])
        elif template.id == 3:
            steps.extend([
                {"title": "Dilution", "description": "Dilute 1:100 with water.", "details": "Prepare the fertilizer mix.", "completed": False},
                {"title": "Application Prep", "description": "Transfer to watering can.", "details": "Ready the watering can for application.", "completed": False}
            ])
        elif template.id == 4:
            steps.extend([
                {"title": "Dilution", "description": "Dilute 1:10 with water.", "details": "Prepare the repellent mix.", "completed": False},
                {"title": "Testing", "description": "Test on a small area.", "details": "Apply to a single leaf first.", "completed": False}
            ])
        elif template.id == 5:
            steps.extend([
                {"title": "Measurement", "description": "Measure the required amount.", "details": "Use undiluted solution.", "completed": False},
                {"title": "Application", "description": "Pour into drain.", "details": "Let it sit overnight.", "completed": False}
            ])
        elif template.id == 6:
            steps.extend([
                {"title": "Dilution", "description": "Dilute 1:20 with water.", "details": "Mix the neutralizer solution.", "completed": False},
                {"title": "Testing", "description": "Test on fabric.", "details": "Test on an inconspicuous area first.", "completed": False}
            ])
        elif template.id == 7:
            steps.extend([
                {"title": "Filtering", "description": "Filter the eco-enzyme thoroughly.", "details": "Ensure there are no large particles.", "completed": False},
                {"title": "Mixing", "description": "Mix with carrier and essential oils.", "details": "Follow the cosmetic recipe.", "completed": False},
                {"title": "Patch Test", "description": "Perform a patch test.", "details": "Apply a small amount to skin and wait 24 hours.", "completed": False}
            ])
        elif template.id == 8:
            steps.extend([
                {"title": "Consultation", "description": "Consult veterinarian.", "details": "Confirm dosage with a professional.", "completed": False},
                {"title": "Dilution", "description": "Dilute 1:200 with water.", "details": "Mix the additive thoroughly.", "completed": False},
                {"title": "Mixing Feed", "description": "Mix into animal feed.", "details": "Ensure even distribution.", "completed": False}
            ])
        else:
            steps.append({"title": "Processing", "description": "Follow instructions.", "details": template.processing_instructions, "completed": False})

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
            raise ValueError("Invalid step index")

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
