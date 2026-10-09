const supabaseUrl = 'https://niedlctgtghfwrgrcmso.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZWRsY3RndGdoZndyZ3JjbXNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTQ1OTgxMywiZXhwIjoyMTA3MDM1ODEzfQ.3rXYi83aY4jtFDfVfop0tnrn8ZPEskFt-oz1FmQ0eB0';

async function checkClassesTable() {
  console.log('Testing classes table in live Supabase DB...');
  const res = await fetch(`${supabaseUrl}/rest/v1/classes?select=*`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (res.ok) {
    const data = await res.json();
    console.log('Classes table exists! Current classes count:', data.length);
  } else {
    console.log('Classes table status:', res.status, await res.text());
  }
}

checkClassesTable();
