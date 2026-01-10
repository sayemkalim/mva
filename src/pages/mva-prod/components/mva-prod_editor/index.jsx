import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Navbar2 } from "@/components/navbar2";
import { fetchMvaProdById } from "../../helpers/fetchMvaProdById";
import { createMvaProd, updateMvaProd } from "../../helpers/createMvaProd";
import Billing from "@/components/billing";

export default function MvaPage() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const {
    data: mvaResp,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["mva", id],
    queryFn: () => fetchMvaProdById(id),
    enabled: Boolean(isEditMode && id),
  });

  const mvaRecord = mvaResp?.data || null;

  const [formData, setFormData] = useState({
    referral: "",
    client_name: "",
    client_address: "",
    client_phone: "",
    client_email: "",
    client_date_of_birth: "",
    client_gender: "",
    client_driver_license: "",
    client_health_card: "",
    client_sin: "",
    client_marital_status: "",
    client_language_spoken: "",
    do_you_require_an_interpreter: false,
    client_Any_dependants: "",
    how_many_persons: "",
    emergency_name: "",
    emergency_telephone: "",
    emergency_email: "",
    contact_name_1: "",
    contact_telephone_1: "",
    contact_email_1: "",
    contact_name_2: "",
    contact_telephone_2: "",
    contact_email_2: "",
    accident_date_of_lose: "",
    accident_time: "",
    accident_location: "",
    accident_city: "",
    were_you_a_driver_passenger: "",
    were_you_wearing_your_seat_belt: false,
    how_did_the_accident_occur: "",
    did_the_accident_occur_while_at_work: false,
    did_the_client_file_the_claim_with_wsib: false,
    was_the_accident_reported_to_the_police: false,
    were_you_wearing_your_seat_belt_2nd: false,
    did_you_take_any_pictures_of_the_scene_of_the_accident: false,
    did_the_ambulance_come_to_the_scene_of_the: false,
    were_you_charged: false,
    did_the_police_arrive_at_the_scene: false,
    if_yes_did_the_police_officer_give_you_an_occurrence: false,
    if_no_did_you_report_the_accident_to_a_self_collision_report_center: false,
    which_collision_center_did_you_report_this_accident_to: "",
    if_no_did_you_report_the_accident_to_a: false,
    Which_collision_center_did_you_report_this_accident_to: "",
    was_the_patient_able_to_return_to_normal_activities: false,
    did_the_patient_go_to_the_hospital: false,
    did_the_patient_see_a_health_professional: false,
    If_yes_give_detail: "",
    police_department: "",
    officer_name: "",
    badge: "",
    division: "",
    report: "",
    aware_of_any_witnesses: false,
    witnesses_desc: "",
    accident_benefits_name_of_policyholder: "",
    accident_insurance_company: "",
    policy_no: "",
    claim_no: "",
    adjuster_name: "",
    adjuster_contact_information: "",
    adjuster_tel: "",
    fax: "",
    make: "",
    model: "",
    colour: "",
    plate: "",
    name_of_driver: "",
    address_of_driver: "",
    driver_telephone: "",
    name_of_owner: "",
    address_of_Owner: "",
    driver_telephone_2nd: "",
    third_party_name_of_driver: "",
    third_party_address_of_driver: "",
    third_party_telephone_of_drive: "",
    third_party_drivers_license: "",
    third_party_name_of_vehicle_owner: "",
    third_party_address_of_vehicle_qwner: "",
    third_party_vehicle_telephone_of_owner: "",
    third_party_name_of_insurance_company: "",
    third_party_policy_number: "",
    third_party_make: "",
    third_party_model: "",
    third_party_year: "",
    third_party_plate: "",
    previous_counsel_for_your_accident: false,
    previous_counsel_name_of_firm: "",
    previous_counsel_name_of_counsel: "",
    previous_counsel_address: "",
    previous_counsel_telephone: "",
    did_you_go_to_the_hospital_after_the_accident: false,
    hospital_information_which_hospital: "",
    hospital_date: "",
    hospital_information_what_date_did_you_go_to_the_hospital: false,
    hospital_information_were_you_taken_there_by_ambulance: false,
    hospital_information_were_you_transferred_to_another_hospital: false,
    hospital_information_please_provide_the_name_and_the_date: "",
    were_any_x_ray_mri_ultrasound: false,
    if_yes_where: "",
    on_what_body_part: "",
    what_type_of_scan: "",
    any_surgeries_after_the_accident: false,
    please_explain_the_type_of_surgery: "",
    did_you_visit_your_family_doctor: false,
    are_you_scheduled_to_see_your_family_doctor_any_time_soon: false,
    how_long_have_you_been_seeing_this_family_doctor_for: "",
    any_previous_family_doctors_in_the_last_three_years: false,
    name_of_family_doctor: "",
    address_of_family_doctor: "",
    telephone: "",
    family_doctor_fax: "",
    family_doctor_name_of_previous: "",
    family_doctor_address_of_previous: "",
    family_doctor_telephone_2nd: "",
    family_doctor_fax_2nd: "",
    have_you_been_referred_to_a_specialist_by_your: false,
    provide_the_name_and_contact_information: "",
    name_of_specialist_doctor: "",
    address_of_specialist_doctor: "",
    specialis_information_telephone: "",
    specialis_information_fax: "",
    specialis_information_specialty: "",
    name_of_specialist_doctor_2nd: "",
    address_of_specialist_doctor_2nd: "",
    specialis_information_telephone_2nd: "",
    specialis_information_fax_2nd: "",
    specialis_information_specialty_2nd: "",
    describe_your_injuries_as_a_result_of_this_accident: "",
    did_you_sustain_any_fractures: false,
    do_you_have_any_numbness_or_tingling: false,
    specialis_information_please_describe_where: "",
    do_you_have_any_pre_existing_injuries: false,
    please_describe_each_injury_both_physical: "",
    physio_chirp_name_of_clinic: "",
    physio_chirp_address_of_clinic: "",
    physio_chirp_name_of_doctor_treating: "",
    physio_chirp_tel: "",
    physio_chirp_fax: "",
    nampharmacy_in_foe_of_pharmacy: "",
    pharmacy_info_address_of_pharmacy: "",
    pharmacy_info_pharmacy_tel: "",
    pharmacy_info_pharmacy_fax: "",
    were_you_employed_at_the_time_of_the_accident: false,
    income_loss_name_of_employer: "",
    income_loss_address_of_employer: "",
    income_loss_name_of_supervisor: "",
    income_loss_position: "",
    income_loss_salary: "",
    income_loss_length_of_tenure: "",
    income_loss_start_date: "",
    income_loss_end_daye_if_any: "",
    did_you_do_overtime_hours_before_the_accident: false,
    did_you_take_any_time_off_work_since_the_accident: false,
    if_yes_then_how_much_time: "",
    have_you_now_returned_to_work: false,
    if_yes_did_you_return_to_work_on_modified_duties: false,
    in_the_last_three_years_have_you_worked_anywhere_else: false,
    name_previous_name_of_employer: "",
    name_previous_address_of_employer: "",
    name_previous_supervisor_of_name: "",
    name_previous_position: "",
    name_previous_salary: "",
    name_previous_length_of_tenure: "",
    student_information_name_of_school: "",
    student_information_address_of_school: "",
    date_of_aatended: "",
    student_information_program_and_lavel: "",
    student_information_projected_date_for_completion: "",
    are_you_now_attending_school: false,
    were_you_able_to_return_to_school_after_the_accident: false,
    do_you_have_short_term_or_long_term_disability: false,
    do_you_have_extended_health_care_benefits: false,
    benefits_information_name_of_insurer: "",
    benefits_information_policy_number: "",
    extended_health_name_of_insurer: "",
    extended_health_policy_number: "",
    were_you_the_main_caregiver_to_people_living_with_you_at_the_time_of_the_accident: false,
    where_you_paid_to_provide_care_to_thes_people: false,
    list_the_people_who_you_were_caring_for_at_the_time_of_the_accident: "",
    did_your_injuries_prevent_you_from_performing_the_caregiving: false,
    extended_health_if_yes_since: "",
    have_you_received_any_ei_in_the_last_one_year: false,
    are_you_currently_on_ei: false,
    ave_you_been_on_social_works_odsp_or_cpp: false,
    please_advise_since_when_and_the_reasons: "",
    recreation_activities: "",
    other_notes: "",
    other_welcome_latters: "",
    other_police_report: "",
    property_damage_file: "",
    other_accident_benefits_file: "",
    family_doctor_clinical_note_and_record: "",
    specialist_clinical_notes_and_record: "",
    hospital_records_ambulance_call_report: "",
    other_tax_returns: "",
    other_employment_file: "",
    other_prescription_summary: "",
    other_student_file: "",
    ocf_1_10: false,
    ocf_2: false,
    ocf_3: false,
  });

  useEffect(() => {
    if (!mvaRecord) return;

    const d = mvaRecord;

    const bool = (val) => val === "on" || val === true;

    setFormData((prev) => ({
      ...prev,
      referral: d.referral || "",
      client_name: d.client_name || "",
      client_address: d.client_address || "",
      client_phone: d.client_phone || "",
      client_email: d.client_email || "",
      client_date_of_birth: d.client_date_of_birth || "",
      client_gender: d.client_gender || "",
      client_driver_license: d.client_driver_license || "",
      client_health_card: d.client_health_card || "",
      client_sin: d.client_sin || "",
      client_marital_status: d.client_marital_status || "",
      client_language_spoken: d.client_language_spoken || "",
      do_you_require_an_interpreter: bool(d.do_you_require_an_interpreter),
      client_Any_dependants: d.client_Any_dependants || "",
      how_many_persons: d.how_many_persons || "",
      emergency_name: d.emergency_name || "",
      emergency_telephone: d.emergency_telephone || "",
      emergency_email: d.emergency_email || "",
      contact_name_1: d.contact_name_1 || "",
      contact_telephone_1: d.contact_telephone_1 || "",
      contact_email_1: d.contact_email_1 || "",
      contact_name_2: d.contact_name_2 || "",
      contact_telephone_2: d.contact_telephone_2 || "",
      contact_email_2: d.contact_email_2 || "",
      accident_date_of_lose: d.accident_date_of_lose || "",
      accident_time: d.accident_time || "",
      accident_location: d.accident_location || "",
      accident_city: d.accident_city || "",
      were_you_a_driver_passenger: d.were_you_a_driver_passenger || "",
      were_you_wearing_your_seat_belt: bool(d.were_you_wearing_your_seat_belt),
      how_did_the_accident_occur: d.how_did_the_accident_occur || "",
      did_the_accident_occur_while_at_work: bool(
        d.did_the_accident_occur_while_at_work
      ),
      did_the_client_file_the_claim_with_wsib: bool(
        d.did_the_client_file_the_claim_with_wsib
      ),
      was_the_accident_reported_to_the_police: bool(
        d.was_the_accident_reported_to_the_police
      ),
      were_you_wearing_your_seat_belt_2nd: bool(
        d.were_you_wearing_your_seat_belt_2nd
      ),
      did_you_take_any_pictures_of_the_scene_of_the_accident: bool(
        d.did_you_take_any_pictures_of_the_scene_of_the_accident
      ),
      did_the_ambulance_come_to_the_scene_of_the: bool(
        d.did_the_ambulance_come_to_the_scene_of_the
      ),
      were_you_charged: bool(d.were_you_charged),
      did_the_police_arrive_at_the_scene: bool(
        d.did_the_police_arrive_at_the_scene
      ),
      if_yes_did_the_police_officer_give_you_an_occurrence: bool(
        d.if_yes_did_the_police_officer_give_you_an_occurrence
      ),
      if_no_did_you_report_the_accident_to_a_self_collision_report_center: bool(
        d.if_no_did_you_report_the_accident_to_a_self_collision_report_center
      ),
      which_collision_center_did_you_report_this_accident_to:
        d.which_collision_center_did_you_report_this_accident_to || "",
      if_no_did_you_report_the_accident_to_a: bool(
        d.if_no_did_you_report_the_accident_to_a
      ),
      Which_collision_center_did_you_report_this_accident_to:
        d.Which_collision_center_did_you_report_this_accident_to || "",
      was_the_patient_able_to_return_to_normal_activities: bool(
        d.was_the_patient_able_to_return_to_normal_activities
      ),
      did_the_patient_go_to_the_hospital: bool(
        d.did_the_patient_go_to_the_hospital
      ),
      did_the_patient_see_a_health_professional: bool(
        d.did_the_patient_see_a_health_professional
      ),
      If_yes_give_detail: d.If_yes_give_detail || "",
      police_department: d.police_department || "",
      officer_name: d.officer_name || "",
      badge: d.badge || "",
      division: d.division || "",
      report: d.report || "",
      aware_of_any_witnesses: bool(d.aware_of_any_witnesses),
      witnesses_desc: d.witnesses_desc || "",
      accident_benefits_name_of_policyholder:
        d.accident_benefits_name_of_policyholder || "",
      accident_insurance_company: d.accident_insurance_company || "",
      policy_no: d.policy_no || "",
      claim_no: d.claim_no || "",
      adjuster_name: d.adjuster_name || "",
      adjuster_contact_information: d.adjuster_contact_information || "",
      adjuster_tel: d.adjuster_tel || "",
      fax: d.fax || "",
      make: d.make || "",
      model: d.model || "",
      colour: d.colour || "",
      plate: d.plate || "",
      name_of_driver: d.name_of_driver || "",
      address_of_driver: d.address_of_driver || "",
      driver_telephone: d.driver_telephone || "",
      name_of_owner: d.name_of_owner || "",
      address_of_Owner: d.address_of_Owner || "",
      driver_telephone_2nd: d.driver_telephone_2nd || "",
      third_party_name_of_driver: d.third_party_name_of_driver || "",
      third_party_address_of_driver: d.third_party_address_of_driver || "",
      third_party_telephone_of_drive: d.third_party_telephone_of_drive || "",
      third_party_drivers_license: d.third_party_drivers_license || "",
      third_party_name_of_vehicle_owner:
        d.third_party_name_of_vehicle_owner || "",
      third_party_address_of_vehicle_qwner:
        d.third_party_address_of_vehicle_qwner || "",
      third_party_vehicle_telephone_of_owner:
        d.third_party_vehicle_telephone_of_owner || "",
      third_party_name_of_insurance_company:
        d.third_party_name_of_insurance_company || "",
      third_party_policy_number: d.third_party_policy_number || "",
      third_party_make: d.third_party_make || "",
      third_party_model: d.third_party_model || "",
      third_party_year: d.third_party_year || "",
      third_party_plate: d.third_party_plate || "",
      previous_counsel_for_your_accident: bool(
        d.previous_counsel_for_your_accident
      ),
      previous_counsel_name_of_firm: d.previous_counsel_name_of_firm || "",
      previous_counsel_name_of_counsel:
        d.previous_counsel_name_of_counsel || "",
      previous_counsel_address: d.previous_counsel_address || "",
      previous_counsel_telephone: d.previous_counsel_telephone || "",
      did_you_go_to_the_hospital_after_the_accident: bool(
        d.did_you_go_to_the_hospital_after_the_accident
      ),
      hospital_information_which_hospital:
        d.hospital_information_which_hospital || "",
      hospital_date: d.hospital_date || "",
      hospital_information_what_date_did_you_go_to_the_hospital: bool(
        d.hospital_information_what_date_did_you_go_to_the_hospital
      ),
      hospital_information_were_you_taken_there_by_ambulance: bool(
        d.hospital_information_were_you_taken_there_by_ambulance
      ),
      hospital_information_were_you_transferred_to_another_hospital: bool(
        d.hospital_information_were_you_transferred_to_another_hospital
      ),
      hospital_information_please_provide_the_name_and_the_date:
        d.hospital_information_please_provide_the_name_and_the_date || "",
      were_any_x_ray_mri_ultrasound: bool(d.were_any_x_ray_mri_ultrasound),
      if_yes_where: d.if_yes_where || "",
      on_what_body_part: d.on_what_body_part || "",
      what_type_of_scan: d.what_type_of_scan || "",
      any_surgeries_after_the_accident: bool(
        d.any_surgeries_after_the_accident
      ),
      please_explain_the_type_of_surgery:
        d.please_explain_the_type_of_surgery || "",
      did_you_visit_your_family_doctor: bool(
        d.did_you_visit_your_family_doctor
      ),
      are_you_scheduled_to_see_your_family_doctor_any_time_soon: bool(
        d.are_you_scheduled_to_see_your_family_doctor_any_time_soon
      ),
      how_long_have_you_been_seeing_this_family_doctor_for:
        d.how_long_have_you_been_seeing_this_family_doctor_for || "",
      any_previous_family_doctors_in_the_last_three_years: bool(
        d.any_previous_family_doctors_in_the_last_three_years
      ),
      name_of_family_doctor: d.name_of_family_doctor || "",
      address_of_family_doctor: d.address_of_family_doctor || "",
      telephone: d.telephone || "",
      family_doctor_fax: d.family_doctor_fax || "",
      family_doctor_name_of_previous: d.family_doctor_name_of_previous || "",
      family_doctor_address_of_previous:
        d.family_doctor_address_of_previous || "",
      family_doctor_telephone_2nd: d.family_doctor_telephone_2nd || "",
      family_doctor_fax_2nd: d.family_doctor_fax_2nd || "",
      have_you_been_referred_to_a_specialist_by_your: bool(
        d.have_you_been_referred_to_a_specialist_by_your
      ),
      provide_the_name_and_contact_information:
        d.provide_the_name_and_contact_information || "",
      name_of_specialist_doctor: d.name_of_specialist_doctor || "",
      address_of_specialist_doctor: d.address_of_specialist_doctor || "",
      specialis_information_telephone: d.specialis_information_telephone || "",
      specialis_information_fax: d.specialis_information_fax || "",
      specialis_information_specialty: d.specialis_information_specialty || "",
      name_of_specialist_doctor_2nd: d.name_of_specialist_doctor_2nd || "",
      address_of_specialist_doctor_2nd:
        d.address_of_specialist_doctor_2nd || "",
      specialis_information_telephone_2nd:
        d.specialis_information_telephone_2nd || "",
      specialis_information_fax_2nd: d.specialis_information_fax_2nd || "",
      specialis_information_specialty_2nd:
        d.specialis_information_specialty_2nd || "",
      describe_your_injuries_as_a_result_of_this_accident:
        d.describe_your_injuries_as_a_result_of_this_accident || "",
      did_you_sustain_any_fractures: bool(d.did_you_sustain_any_fractures),
      do_you_have_any_numbness_or_tingling: bool(
        d.do_you_have_any_numbness_or_tingling
      ),
      specialis_information_please_describe_where:
        d.specialis_information_please_describe_where || "",
      do_you_have_any_pre_existing_injuries: bool(
        d.do_you_have_any_pre_existing_injuries
      ),
      please_describe_each_injury_both_physical:
        d.please_describe_each_injury_both_physical || "",
      physio_chirp_name_of_clinic: d.physio_chirp_name_of_clinic || "",
      physio_chirp_address_of_clinic: d.physio_chirp_address_of_clinic || "",
      physio_chirp_name_of_doctor_treating:
        d.physio_chirp_name_of_doctor_treating || "",
      physio_chirp_tel: d.physio_chirp_tel || "",
      physio_chirp_fax: d.physio_chirp_fax || "",
      nampharmacy_in_foe_of_pharmacy: d.nampharmacy_in_foe_of_pharmacy || "",
      pharmacy_info_address_of_pharmacy:
        d.pharmacy_info_address_of_pharmacy || "",
      pharmacy_info_pharmacy_tel: d.pharmacy_info_pharmacy_tel || "",
      pharmacy_info_pharmacy_fax: d.pharmacy_info_pharmacy_fax || "",
      were_you_employed_at_the_time_of_the_accident: bool(
        d.were_you_employed_at_the_time_of_the_accident
      ),
      income_loss_name_of_employer: d.income_loss_name_of_employer || "",
      income_loss_address_of_employer: d.income_loss_address_of_employer || "",
      income_loss_name_of_supervisor: d.income_loss_name_of_supervisor || "",
      income_loss_position: d.income_loss_position || "",
      income_loss_salary: d.income_loss_salary || "",
      income_loss_length_of_tenure: d.income_loss_length_of_tenure || "",
      income_loss_start_date: d.income_loss_start_date || "",
      income_loss_end_daye_if_any: d.income_loss_end_daye_if_any || "",
      did_you_do_overtime_hours_before_the_accident: bool(
        d.did_you_do_overtime_hours_before_the_accident
      ),
      did_you_take_any_time_off_work_since_the_accident: bool(
        d.did_you_take_any_time_off_work_since_the_accident
      ),
      if_yes_then_how_much_time: d.if_yes_then_how_much_time || "",
      have_you_now_returned_to_work: bool(d.have_you_now_returned_to_work),
      if_yes_did_you_return_to_work_on_modified_duties: bool(
        d.if_yes_did_you_return_to_work_on_modified_duties
      ),
      in_the_last_three_years_have_you_worked_anywhere_else: bool(
        d.in_the_last_three_years_have_you_worked_anywhere_else
      ),
      name_previous_name_of_employer: d.name_previous_name_of_employer || "",
      name_previous_address_of_employer:
        d.name_previous_address_of_employer || "",
      name_previous_supervisor_of_name:
        d.name_previous_supervisor_of_name || "",
      name_previous_position: d.name_previous_position || "",
      name_previous_salary: d.name_previous_salary || "",
      name_previous_length_of_tenure: d.name_previous_length_of_tenure || "",
      student_information_name_of_school:
        d.student_information_name_of_school || "",
      student_information_address_of_school:
        d.student_information_address_of_school || "",
      date_of_aatended: d.date_of_aatended || "",
      student_information_program_and_lavel:
        d.student_information_program_and_lavel || "",
      student_information_projected_date_for_completion:
        d.student_information_projected_date_for_completion || "",
      are_you_now_attending_school: bool(d.are_you_now_attending_school),
      were_you_able_to_return_to_school_after_the_accident: bool(
        d.were_you_able_to_return_to_school_after_the_accident
      ),
      do_you_have_short_term_or_long_term_disability: bool(
        d.do_you_have_short_term_or_long_term_disability
      ),
      do_you_have_extended_health_care_benefits: bool(
        d.do_you_have_extended_health_care_benefits
      ),
      benefits_information_name_of_insurer:
        d.benefits_information_name_of_insurer || "",
      benefits_information_policy_number:
        d.benefits_information_policy_number || "",
      extended_health_name_of_insurer: d.extended_health_name_of_insurer || "",
      extended_health_policy_number: d.extended_health_policy_number || "",
      were_you_the_main_caregiver_to_people_living_with_you_at_the_time_of_the_accident:
        bool(
          d.were_you_the_main_caregiver_to_people_living_with_you_at_the_time_of_the_accident
        ),
      where_you_paid_to_provide_care_to_thes_people: bool(
        d.where_you_paid_to_provide_care_to_thes_people
      ),
      list_the_people_who_you_were_caring_for_at_the_time_of_the_accident:
        d.list_the_people_who_you_were_caring_for_at_the_time_of_the_accident ||
        "",
      did_your_injuries_prevent_you_from_performing_the_caregiving: bool(
        d.did_your_injuries_prevent_you_from_performing_the_caregiving
      ),
      extended_health_if_yes_since: d.extended_health_if_yes_since || "",
      have_you_received_any_ei_in_the_last_one_year: bool(
        d.have_you_received_any_ei_in_the_last_one_year
      ),
      are_you_currently_on_ei: bool(d.are_you_currently_on_ei),
      ave_you_been_on_social_works_odsp_or_cpp: bool(
        d.ave_you_been_on_social_works_odsp_or_cpp
      ),
      please_advise_since_when_and_the_reasons:
        d.please_advise_since_when_and_the_reasons || "",
      recreation_activities: d.recreation_activities || "",
      other_notes: d.other_notes || "",
      other_welcome_latters: d.other_welcome_latters || "",
      other_police_report: d.other_police_report || "",
      property_damage_file: d.property_damage_file || "",
      other_accident_benefits_file: d.other_accident_benefits_file || "",
      family_doctor_clinical_note_and_record:
        d.family_doctor_clinical_note_and_record || "",
      specialist_clinical_notes_and_record:
        d.specialist_clinical_notes_and_record || "",
      hospital_records_ambulance_call_report:
        d.hospital_records_ambulance_call_report || "",
      other_tax_returns: d.other_tax_returns || "",
      other_employment_file: d.other_employment_file || "",
      other_prescription_summary: d.other_prescription_summary || "",
      other_student_file: d.other_student_file || "",
      ocf_1_10: bool(d.ocf_1_10),
      ocf_2: bool(d.ocf_2),
      ocf_3: bool(d.ocf_3),
    }));
  }, [mvaRecord]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleCheckbox = (field, checked) =>
    setFormData((prev) => ({ ...prev, [field]: checked }));

  const saveMutation = useMutation({
    mutationFn: ({ isEdit, idOrSlug, data }) =>
      isEdit
        ? updateMvaProd(idOrSlug, data)
        : createMvaProd({ slug: idOrSlug, data }),
    onSuccess: (res, variables) => {
      console.log("MVA save success =>", { res, variables });
      const r = res?.data || res;
      toast.success(r?.message || "MVA saved successfully");
      queryClient.invalidateQueries({ queryKey: ["mva"] });
      navigate(-1);
    },
    onError: (error, variables) => {
      console.error("MVA save error =>", { error, variables });
      toast.error("Failed to save MVA");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = formData;
    console.log("📤 Final MVA data:", data);
    const recordId = mvaResp?.id;

    saveMutation.mutate({
      isEdit: isEditMode,
      idOrSlug: isEditMode ? recordId || id : slug,
      data,
    });
  };

  if (isEditMode && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading MVA...</span>
      </div>
    );
  }

  if (error) {
    console.error("MVA fetch error =>", error);
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />
<Billing/>
      <nav className="bg-card border-b px-6 py-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="hover:text-foreground transition-colors"
          >
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            type="button"
            onClick={() => navigate("/dashboard/workstation")}
            className="hover:text-foreground transition-colors"
          >
            Workstation
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">
            {isEditMode ? "Edit" : "New"} MVA Intake
          </span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {isEditMode ? "Edit MVA" : "New MVA"}
          </h1>
          {/* <div className="text-sm text-gray-500">{isEditMode.toString()}</div> */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <Section title="Client Information">
            <Grid>
              <Field
                label="Referral"
                value={formData.referral}
                onChange={(v) => handleChange("referral", v)}
              />
              <Field
                label="Client Name"
                value={formData.client_name}
                onChange={(v) => handleChange("client_name", v)}
              />
              <Field
                label="Address"
                value={formData.client_address}
                onChange={(v) => handleChange("client_address", v)}
              />
              <Field
                label="Phone"
                value={formData.client_phone}
                onChange={(v) => handleChange("client_phone", v)}
              />
              <Field
                label="Email"
                value={formData.client_email}
                onChange={(v) => handleChange("client_email", v)}
              />
              <Field
                type="date"
                label="Date of Birth"
                value={formData.client_date_of_birth}
                onChange={(v) => handleChange("client_date_of_birth", v)}
              />
              <Field
                label="Gender"
                value={formData.client_gender}
                onChange={(v) => handleChange("client_gender", v)}
              />
              <Field
                label="Driver License"
                value={formData.client_driver_license}
                onChange={(v) => handleChange("client_driver_license", v)}
              />
              <Field
                label="Health Card"
                value={formData.client_health_card}
                onChange={(v) => handleChange("client_health_card", v)}
              />
              <Field
                label="SIN"
                value={formData.client_sin}
                onChange={(v) => handleChange("client_sin", v)}
              />
              <Field
                label="Marital Status"
                value={formData.client_marital_status}
                onChange={(v) => handleChange("client_marital_status", v)}
              />
              <Field
                label="Language Spoken"
                value={formData.client_language_spoken}
                onChange={(v) => handleChange("client_language_spoken", v)}
              />
              <CheckboxField
                label="Require Interpreter?"
                checked={formData.do_you_require_an_interpreter}
                onChange={(c) =>
                  handleCheckbox("do_you_require_an_interpreter", c)
                }
              />
              <Field
                label="Any Dependants?"
                value={formData.client_Any_dependants}
                onChange={(v) => handleChange("client_Any_dependants", v)}
              />
              <Field
                label="How Many Persons"
                value={formData.how_many_persons}
                onChange={(v) => handleChange("how_many_persons", v)}
              />
            </Grid>
          </Section>

          {/* Emergency & Contacts */}
          <Section title="Emergency & Contacts">
            <Grid>
              <Field
                label="Emergency Name"
                value={formData.emergency_name}
                onChange={(v) => handleChange("emergency_name", v)}
              />
              <Field
                label="Emergency Telephone"
                value={formData.emergency_telephone}
                onChange={(v) => handleChange("emergency_telephone", v)}
              />
              <Field
                label="Emergency Email"
                value={formData.emergency_email}
                onChange={(v) => handleChange("emergency_email", v)}
              />
              <Field
                label="Contact Name 1"
                value={formData.contact_name_1}
                onChange={(v) => handleChange("contact_name_1", v)}
              />
              <Field
                label="Contact Telephone 1"
                value={formData.contact_telephone_1}
                onChange={(v) => handleChange("contact_telephone_1", v)}
              />
              <Field
                label="Contact Email 1"
                value={formData.contact_email_1}
                onChange={(v) => handleChange("contact_email_1", v)}
              />
              <Field
                label="Contact Name 2"
                value={formData.contact_name_2}
                onChange={(v) => handleChange("contact_name_2", v)}
              />
              <Field
                label="Contact Telephone 2"
                value={formData.contact_telephone_2}
                onChange={(v) => handleChange("contact_telephone_2", v)}
              />
              <Field
                label="Contact Email 2"
                value={formData.contact_email_2}
                onChange={(v) => handleChange("contact_email_2", v)}
              />
            </Grid>
          </Section>

          {/* Accident */}
          <Section title="Accident Details">
            <Grid>
              <Field
                type="date"
                label="Date of Loss"
                value={formData.accident_date_of_lose}
                onChange={(v) => handleChange("accident_date_of_lose", v)}
              />
              <Field
                type="time"
                label="Time"
                value={formData.accident_time}
                onChange={(v) => handleChange("accident_time", v)}
              />
              <Field
                label="Location"
                value={formData.accident_location}
                onChange={(v) => handleChange("accident_location", v)}
              />
              <Field
                label="City"
                value={formData.accident_city}
                onChange={(v) => handleChange("accident_city", v)}
              />
              <Field
                label="Driver / Passenger"
                value={formData.were_you_a_driver_passenger}
                onChange={(v) => handleChange("were_you_a_driver_passenger", v)}
              />
              <CheckboxField
                label="Wearing Seatbelt?"
                checked={formData.were_you_wearing_your_seat_belt}
                onChange={(c) =>
                  handleCheckbox("were_you_wearing_your_seat_belt", c)
                }
              />
              <TextField
                label="How did the accident occur?"
                value={formData.how_did_the_accident_occur}
                onChange={(v) => handleChange("how_did_the_accident_occur", v)}
              />
              <CheckboxField
                label="Accident occurred at work?"
                checked={formData.did_the_accident_occur_while_at_work}
                onChange={(c) =>
                  handleCheckbox("did_the_accident_occur_while_at_work", c)
                }
              />
              <CheckboxField
                label="Claim filed with WSIB?"
                checked={formData.did_the_client_file_the_claim_with_wsib}
                onChange={(c) =>
                  handleCheckbox("did_the_client_file_the_claim_with_wsib", c)
                }
              />
              <CheckboxField
                label="Accident reported to police?"
                checked={formData.was_the_accident_reported_to_the_police}
                onChange={(c) =>
                  handleCheckbox("was_the_accident_reported_to_the_police", c)
                }
              />
              <CheckboxField
                label="Wearing seatbelt (2nd)?"
                checked={formData.were_you_wearing_your_seat_belt_2nd}
                onChange={(c) =>
                  handleCheckbox("were_you_wearing_your_seat_belt_2nd", c)
                }
              />
              <CheckboxField
                label="Pictures taken at scene?"
                checked={
                  formData.did_you_take_any_pictures_of_the_scene_of_the_accident
                }
                onChange={(c) =>
                  handleCheckbox(
                    "did_you_take_any_pictures_of_the_scene_of_the_accident",
                    c
                  )
                }
              />
              <CheckboxField
                label="Ambulance came?"
                checked={formData.did_the_ambulance_come_to_the_scene_of_the}
                onChange={(c) =>
                  handleCheckbox(
                    "did_the_ambulance_come_to_the_scene_of_the",
                    c
                  )
                }
              />
              <CheckboxField
                label="Were you charged?"
                checked={formData.were_you_charged}
                onChange={(c) => handleCheckbox("were_you_charged", c)}
              />
              <CheckboxField
                label="Police arrived at scene?"
                checked={formData.did_the_police_arrive_at_the_scene}
                onChange={(c) =>
                  handleCheckbox("did_the_police_arrive_at_the_scene", c)
                }
              />
              <CheckboxField
                label="Police gave occurrence number?"
                checked={
                  formData.if_yes_did_the_police_officer_give_you_an_occurrence
                }
                onChange={(c) =>
                  handleCheckbox(
                    "if_yes_did_the_police_officer_give_you_an_occurrence",
                    c
                  )
                }
              />
              <CheckboxField
                label="Reported to self collision center?"
                checked={
                  formData.if_no_did_you_report_the_accident_to_a_self_collision_report_center
                }
                onChange={(c) =>
                  handleCheckbox(
                    "if_no_did_you_report_the_accident_to_a_self_collision_report_center",
                    c
                  )
                }
              />
              <Field
                label="Which collision center?"
                value={
                  formData.which_collision_center_did_you_report_this_accident_to
                }
                onChange={(v) =>
                  handleChange(
                    "which_collision_center_did_you_report_this_accident_to",
                    v
                  )
                }
              />
            </Grid>
          </Section>

          {/* Vehicle & Third Party (shortened grouping) */}
          <Section title="Vehicle & Third Party">
            <Grid>
              <Field
                label="Your Vehicle Make"
                value={formData.make}
                onChange={(v) => handleChange("make", v)}
              />
              <Field
                label="Your Vehicle Model"
                value={formData.model}
                onChange={(v) => handleChange("model", v)}
              />
              <Field
                label="Colour"
                value={formData.colour}
                onChange={(v) => handleChange("colour", v)}
              />
              <Field
                label="Plate"
                value={formData.plate}
                onChange={(v) => handleChange("plate", v)}
              />
              <Field
                label="Third Party Driver Name"
                value={formData.third_party_name_of_driver}
                onChange={(v) => handleChange("third_party_name_of_driver", v)}
              />
              <Field
                label="Third Party Driver Address"
                value={formData.third_party_address_of_driver}
                onChange={(v) =>
                  handleChange("third_party_address_of_driver", v)
                }
              />
              <Field
                label="Third Party Vehicle Owner"
                value={formData.third_party_name_of_vehicle_owner}
                onChange={(v) =>
                  handleChange("third_party_name_of_vehicle_owner", v)
                }
              />
              <Field
                label="Third Party Owner Address"
                value={formData.third_party_address_of_vehicle_qwner}
                onChange={(v) =>
                  handleChange("third_party_address_of_vehicle_qwner", v)
                }
              />
              <Field
                label="Third Party Insurance Company"
                value={formData.third_party_name_of_insurance_company}
                onChange={(v) =>
                  handleChange("third_party_name_of_insurance_company", v)
                }
              />
              <Field
                label="Third Party Policy Number"
                value={formData.third_party_policy_number}
                onChange={(v) => handleChange("third_party_policy_number", v)}
              />
            </Grid>
          </Section>

          {/* Medical, Employment, Benefits etc. – you can keep splitting like above */}
          {/* ... */}

          {/* Files / OCF */}
          <Section title="OCF Forms">
            <Grid>
              <CheckboxField
                label="OCF-1/10"
                checked={formData.ocf_1_10}
                onChange={(c) => handleCheckbox("ocf_1_10", c)}
              />
              <CheckboxField
                label="OCF-2"
                checked={formData.ocf_2}
                onChange={(c) => handleCheckbox("ocf_2", c)}
              />
              <CheckboxField
                label="OCF-3"
                checked={formData.ocf_3}
                onChange={(c) => handleCheckbox("ocf_3", c)}
              />
            </Grid>
          </Section>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-8 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="px-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-8 bg-primary hover:bg-primary/90"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save MVA"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

/* Helpers */

function Section({ title, children }) {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
      <h2 className="text-2xl font-semibold text-foreground border-b border-gray-200 pb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 px-4 border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all"
        placeholder={label}
      />
    </div>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <div className="space-y-2 md:col-span-full">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      <Textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="min-h-[100px] border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-vertical"
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
    </div>
  );
}

function CheckboxField({ label, checked, onChange }) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={label} checked={checked} onCheckedChange={onChange} />
      <label
        htmlFor={label}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
    </div>
  );
}
