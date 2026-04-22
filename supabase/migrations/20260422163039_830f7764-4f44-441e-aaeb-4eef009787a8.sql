ALTER TABLE public.access_requests
  ADD CONSTRAINT access_requests_name_len CHECK (char_length(name) BETWEEN 1 AND 200),
  ADD CONSTRAINT access_requests_email_len CHECK (char_length(email) BETWEEN 3 AND 320),
  ADD CONSTRAINT access_requests_company_len CHECK (company IS NULL OR char_length(company) <= 200),
  ADD CONSTRAINT access_requests_role_len CHECK (role IS NULL OR char_length(role) <= 200),
  ADD CONSTRAINT access_requests_use_case_len CHECK (use_case IS NULL OR char_length(use_case) <= 4000);